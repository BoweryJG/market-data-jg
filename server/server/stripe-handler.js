const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Need service key for admin operations
);

class StripeHandler {
  // Create customer and subscription
  async createSubscription(userId, email, planId, paymentMethodId) {
    try {
      // Create or get Stripe customer
      const customer = await this.findOrCreateCustomer(userId, email);
      
      // Attach payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });
      
      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: this.getPriceId(planId) }],
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId
        }
      });
      
      // Update user in database
      await this.updateUserSubscription(userId, {
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        plan_id: planId,
        current_period_end: new Date(subscription.current_period_end * 1000)
      });
      
      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }
  
  // Track usage for metered billing
  async recordUsage(userId, productType, quantity = 1) {
    try {
      const user = await this.getUser(userId);
      
      if (!user.stripe_subscription_id) {
        throw new Error('No active subscription');
      }
      
      // Get subscription item for usage product
      const subscription = await stripe.subscriptions.retrieve(
        user.stripe_subscription_id
      );
      
      const usageItem = subscription.items.data.find(
        item => item.price.metadata.product_type === productType
      );
      
      if (!usageItem) {
        // Add metered product to subscription
        await this.addMeteredProduct(user.stripe_subscription_id, productType);
      }
      
      // Record usage
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        usageItem.id,
        {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment'
        }
      );
      
      // Log usage in database for analytics
      await supabase.from('usage_logs').insert({
        user_id: userId,
        product_type: productType,
        quantity,
        timestamp: new Date(),
        stripe_usage_record_id: usageRecord.id
      });
      
      return usageRecord;
    } catch (error) {
      console.error('Usage recording failed:', error);
      throw error;
    }
  }
  
  // Check subscription status and features
  async checkAccess(userId, feature) {
    try {
      const user = await this.getUser(userId);
      
      if (!user.subscription_status || user.subscription_status !== 'active') {
        return { hasAccess: false, reason: 'No active subscription' };
      }
      
      // Check if current period has ended
      if (new Date() > new Date(user.current_period_end)) {
        return { hasAccess: false, reason: 'Subscription expired' };
      }
      
      // Check feature limits
      const plan = this.getPlanDetails(user.plan_id);
      const usage = await this.getCurrentUsage(userId);
      
      switch (feature) {
        case 'ai_query':
          if (usage.ai_queries >= plan.features.aiQueries) {
            return { 
              hasAccess: false, 
              reason: 'AI query limit reached',
              canPurchase: true,
              price: 0.50
            };
          }
          break;
          
        case 'automation':
          if (!plan.features.automation) {
            return { 
              hasAccess: false, 
              reason: 'Automation not available in current plan',
              upgradeRequired: true
            };
          }
          break;
          
        case 'category':
          if (plan.features.categories !== 'unlimited' && 
              usage.categories >= plan.features.categories) {
            return { 
              hasAccess: false, 
              reason: 'Category limit reached',
              upgradeRequired: true
            };
          }
          break;
      }
      
      return { hasAccess: true };
    } catch (error) {
      console.error('Access check failed:', error);
      return { hasAccess: false, reason: 'Error checking access' };
    }
  }
  
  // Handle webhooks
  async handleWebhook(event) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.updateSubscriptionStatus(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleCancellation(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await this.sendTrialEndingEmail(event.data.object);
        break;
    }
  }
  
  // Helper methods
  async findOrCreateCustomer(userId, email) {
    const { data: user } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (user?.stripe_customer_id) {
      return await stripe.customers.retrieve(user.stripe_customer_id);
    }
    
    const customer = await stripe.customers.create({
      email,
      metadata: { userId }
    });
    
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);
    
    return customer;
  }
  
  getPriceId(planId) {
    const prices = {
      starter: process.env.STRIPE_STARTER_PRICE_ID,
      professional: process.env.STRIPE_PRO_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
    };
    return prices[planId];
  }
  
  getPlanDetails(planId) {
    const plans = {
      starter: {
        features: {
          users: 1,
          aiQueries: 100,
          categories: 5,
          automation: false
        }
      },
      professional: {
        features: {
          users: 5,
          aiQueries: 1000,
          categories: 'unlimited',
          automation: true
        }
      },
      enterprise: {
        features: {
          users: 'unlimited',
          aiQueries: 'unlimited',
          categories: 'unlimited',
          automation: true
        }
      }
    };
    return plans[planId];
  }
  
  async getCurrentUsage(userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: usage } = await supabase
      .from('usage_logs')
      .select('product_type, quantity')
      .eq('user_id', userId)
      .gte('timestamp', startOfMonth.toISOString());
    
    const summary = {
      ai_queries: 0,
      automation_runs: 0,
      categories: 0,
      api_calls: 0
    };
    
    usage?.forEach(record => {
      summary[record.product_type] = (summary[record.product_type] || 0) + record.quantity;
    });
    
    return summary;
  }
  
  async updateUserSubscription(userId, data) {
    await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
  }
  
  async getUser(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }
}

module.exports = StripeHandler;