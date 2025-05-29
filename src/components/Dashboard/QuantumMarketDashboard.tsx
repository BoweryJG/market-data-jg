import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip, Fade, Grow, useTheme, alpha, Fab } from '@mui/material';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
  TrendingUp, 
  FlashOn, 
  Insights, 
  Speed,
  Category,
  MedicalServices,
  Analytics,
  AttachMoney,
  Sort,
  SwapVert,
  AutoAwesome,
  KeyboardVoice,
  Search
} from '@mui/icons-material';
import FloatingInsights from './FloatingInsights';

interface CategoryData {
  id: string;
  name: string;
  procedures: Procedure[];
  marketSize: number;
  growth: number;
  opportunity: number;
  position: [number, number, number];
  color: string;
}

interface Procedure {
  id: string;
  name: string;
  revenue: number;
  volume: number;
  growth: number;
  category: string;
}

interface SortConfig {
  key: keyof Procedure | keyof CategoryData;
  direction: 'asc' | 'desc';
}

const QuantumMarketDashboard: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [salesMode, setSalesMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'revenue', direction: 'desc' });
  const [dataView, setDataView] = useState<'galaxy' | 'matrix' | 'flow'>('galaxy');
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const [voiceMode, setVoiceMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [insights, setInsights] = useState<any[]>([]);

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      const newInsights = [
        {
          id: '1',
          type: 'opportunity' as const,
          title: 'Cardiovascular Growth Spike',
          description: 'Angioplasty procedures up 15% this quarter. Target hospitals in midwest region.',
          priority: 'high' as const,
          action: {
            label: 'View Targets',
            onClick: () => setSelectedCategory(categoryData[0])
          }
        },
        {
          id: '2',
          type: 'trend' as const,
          title: 'Neurology Market Shift',
          description: 'Deep Brain Stimulation becoming standard of care in 3 new states.',
          priority: 'medium' as const
        },
        {
          id: '3',
          type: 'warning' as const,
          title: 'Competitor Alert',
          description: 'MedTech Corp launching competitive orthopedic line next month.',
          priority: 'high' as const,
          action: {
            label: 'View Analysis',
            onClick: () => {}
          }
        },
        {
          id: '4',
          type: 'tip' as const,
          title: 'Optimize Territory Coverage',
          description: 'AI suggests reallocating 2 reps to high-growth cardio territories.',
          priority: 'medium' as const
        }
      ];
      setInsights(newInsights);
    };

    generateInsights();
    const interval = setInterval(generateInsights, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Mock data with proper alignment
  const categoryData: CategoryData[] = useMemo(() => [
    {
      id: 'cardio',
      name: 'Cardiovascular',
      procedures: [
        { id: 'p1', name: 'Angioplasty', revenue: 2500000, volume: 1500, growth: 12, category: 'cardio' },
        { id: 'p2', name: 'Stent Placement', revenue: 3200000, volume: 2000, growth: 15, category: 'cardio' },
        { id: 'p3', name: 'Cardiac Catheterization', revenue: 1800000, volume: 3000, growth: 8, category: 'cardio' }
      ],
      marketSize: 7500000,
      growth: 11.67,
      opportunity: 85,
      position: [-3, 2, 0],
      color: '#FF6B6B'
    },
    {
      id: 'neuro',
      name: 'Neurology',
      procedures: [
        { id: 'p4', name: 'Deep Brain Stimulation', revenue: 4500000, volume: 500, growth: 25, category: 'neuro' },
        { id: 'p5', name: 'Spinal Fusion', revenue: 3800000, volume: 1200, growth: 18, category: 'neuro' },
        { id: 'p6', name: 'Microdiscectomy', revenue: 2100000, volume: 2500, growth: 10, category: 'neuro' }
      ],
      marketSize: 10400000,
      growth: 17.67,
      opportunity: 92,
      position: [3, 1, -2],
      color: '#4ECDC4'
    },
    {
      id: 'ortho',
      name: 'Orthopedics',
      procedures: [
        { id: 'p7', name: 'Total Knee Replacement', revenue: 5200000, volume: 2800, growth: 20, category: 'ortho' },
        { id: 'p8', name: 'Hip Replacement', revenue: 4800000, volume: 2400, growth: 22, category: 'ortho' },
        { id: 'p9', name: 'Arthroscopy', revenue: 1600000, volume: 4000, growth: 5, category: 'ortho' }
      ],
      marketSize: 11600000,
      growth: 15.67,
      opportunity: 88,
      position: [0, -2, 3],
      color: '#95E1D3'
    }
  ], []);

  // Handle mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) / 100);
      mouseY.set((e.clientY - window.innerHeight / 2) / 100);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Sorting functionality
  const handleSort = (key: keyof Procedure | keyof CategoryData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!selectedCategory) return [];
    
    const procedures = [...selectedCategory.procedures];
    procedures.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Procedure];
      const bValue = b[sortConfig.key as keyof Procedure];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    
    return procedures;
  }, [selectedCategory, sortConfig]);

  // 3D Category Sphere Component
  const CategorySphere: React.FC<{ data: CategoryData; isSelected: boolean }> = ({ data, isSelected }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    
    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        if (hovered || isSelected) {
          meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
        } else {
          meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      }
    });

    return (
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          position={data.position}
          onPointerOver={() => {
            setHovered(true);
            setHoveredItem(data.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            setHoveredItem(null);
            document.body.style.cursor = 'default';
          }}
          onClick={() => setSelectedCategory(data)}
        >
          <sphereGeometry args={[1 + (data.marketSize / 5000000), 32, 32]} />
          <MeshDistortMaterial
            color={data.color}
            speed={2}
            distort={0.3}
            radius={1}
            emissive={data.color}
            emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
          />
        </mesh>
        <Text
          position={[data.position[0], data.position[1] + 2, data.position[2]]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {data.name}
        </Text>
      </Float>
    );
  };

  // Sales Mode Toggle with Creative Integration
  const SalesModeToggle = () => {
    const rotateY = useTransform(smoothMouseX, [-10, 10], [-10, 10]);
    const rotateX = useTransform(smoothMouseY, [-10, 10], [10, -10]);

    return (
      <motion.div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSalesMode(!salesMode)}
          style={{
            width: 200,
            height: 80,
            borderRadius: 40,
            background: salesMode 
              ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`
              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            animate={{ x: salesMode ? 100 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            }}
          >
            {salesMode ? <AttachMoney sx={{ color: theme.palette.warning.main }} /> : <Analytics sx={{ color: theme.palette.primary.main }} />}
          </motion.div>
          <Typography 
            variant="body2" 
            sx={{ 
              position: 'absolute',
              left: salesMode ? 20 : 'auto',
              right: salesMode ? 'auto' : 20,
              color: 'white',
              fontWeight: 'bold',
              userSelect: 'none',
            }}
          >
            {salesMode ? 'SALES' : 'INTEL'}
          </Typography>
        </motion.div>
      </motion.div>
    );
  };

  // Matrix View for Categories and Procedures
  const MatrixView = () => {
    return (
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {categoryData.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: categoryIndex * 0.1 }}
              style={{ marginBottom: 24 }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(category.color, 0.1)} 0%, ${alpha(category.color, 0.05)} 100%)`,
                  borderRadius: 4,
                  border: `2px solid ${alpha(category.color, 0.3)}`,
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Animated background pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at ${hoveredItem === category.id ? '50%' : '0%'} 50%, ${alpha(category.color, 0.2)} 0%, transparent 70%)`,
                    transition: 'all 0.5s ease',
                    pointerEvents: 'none',
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Category sx={{ mr: 2, color: category.color }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: category.color }}>
                      {category.name}
                    </Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                      <Tooltip title="Market Size">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoney sx={{ fontSize: 20, mr: 0.5 }} />
                          <Typography variant="body2">${(category.marketSize / 1000000).toFixed(1)}M</Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Growth Rate">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUp sx={{ fontSize: 20, mr: 0.5, color: theme.palette.success.main }} />
                          <Typography variant="body2">{category.growth.toFixed(1)}%</Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Opportunity Score">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlashOn sx={{ fontSize: 20, mr: 0.5, color: theme.palette.warning.main }} />
                          <Typography variant="body2">{category.opportunity}</Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Procedures Table with Sorting */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {['name', 'revenue', 'volume', 'growth'].map((key) => (
                        <IconButton
                          key={key}
                          size="small"
                          onClick={() => handleSort(key as keyof Procedure)}
                          sx={{
                            background: sortConfig.key === key ? alpha(category.color, 0.2) : 'transparent',
                            '&:hover': { background: alpha(category.color, 0.3) },
                          }}
                        >
                          <Tooltip title={`Sort by ${key}`}>
                            <Sort sx={{ fontSize: 16 }} />
                          </Tooltip>
                        </IconButton>
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                      {category.procedures
                        .sort((a, b) => {
                          const aValue = a[sortConfig.key as keyof Procedure];
                          const bValue = b[sortConfig.key as keyof Procedure];
                          
                          if (typeof aValue === 'number' && typeof bValue === 'number') {
                            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                          }
                          
                          return sortConfig.direction === 'asc' 
                            ? String(aValue).localeCompare(String(bValue))
                            : String(bValue).localeCompare(String(aValue));
                        })
                        .map((procedure, index) => (
                          <motion.div
                            key={procedure.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            onHoverStart={() => setHoveredItem(procedure.id)}
                            onHoverEnd={() => setHoveredItem(null)}
                          >
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: alpha(theme.palette.background.paper, 0.8),
                                border: `1px solid ${alpha(category.color, 0.2)}`,
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  borderColor: category.color,
                                  boxShadow: `0 0 20px ${alpha(category.color, 0.3)}`,
                                },
                              }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {procedure.name}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Revenue</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    ${(procedure.revenue / 1000000).toFixed(2)}M
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Volume</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {procedure.volume.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Growth</Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      color: procedure.growth > 15 ? theme.palette.success.main : theme.palette.text.primary,
                                    }}
                                  >
                                    {procedure.growth}%
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {salesMode && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(category.color, 0.2)}` }}>
                                    <Typography variant="caption" color="text.secondary">Sales Actions</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                          padding: '4px 12px',
                                          borderRadius: 16,
                                          border: 'none',
                                          background: alpha(theme.palette.primary.main, 0.1),
                                          color: theme.palette.primary.main,
                                          fontSize: 12,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Contact Lead
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                          padding: '4px 12px',
                                          borderRadius: 16,
                                          border: 'none',
                                          background: alpha(theme.palette.secondary.main, 0.1),
                                          color: theme.palette.secondary.main,
                                          fontSize: 12,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Schedule Demo
                                      </motion.button>
                                    </Box>
                                  </Box>
                                </motion.div>
                              )}
                            </Box>
                          </motion.div>
                        ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </motion.div>
      </Box>
    );
  };

  // Voice command handler
  const handleVoiceCommand = useCallback(() => {
    setVoiceMode(true);
    // In production, integrate with Web Speech API
    setTimeout(() => {
      setVoiceMode(false);
      // Simulate voice command processing
      setSearchQuery('Show me high growth procedures');
    }, 2000);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background with Dynamic Gradients */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${50 + smoothMouseX.get()}% ${50 + smoothMouseY.get()}%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
          transition: 'background 0.3s ease',
          pointerEvents: 'none',
        }}
      />
      
      {/* Particle Effect Overlay */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
        animate={{
          background: [
            `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
            `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      <SalesModeToggle />
      
      {/* Floating AI Insights */}
      <FloatingInsights 
        insights={insights} 
        onDismiss={(id) => setInsights(prev => prev.filter(i => i.id !== id))}
      />
      
      {/* Voice Command FAB */}
      <Fab
        color="primary"
        onClick={handleVoiceCommand}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: voiceMode 
            ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`
            : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          animation: voiceMode ? 'pulse 1s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        <KeyboardVoice />
      </Fab>
      
      {/* Smart Search Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: searchQuery ? 0 : -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          maxWidth: 600,
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            p: 2,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Search />
            <Typography variant="body1" sx={{ flex: 1 }}>
              {searchQuery}
            </Typography>
            <IconButton size="small" onClick={() => setSearchQuery('')}>
              ×
            </IconButton>
          </Box>
        </Box>
      </motion.div>
      
      {/* View Toggle */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 1 }}>
        {['galaxy', 'matrix', 'flow'].map((view) => (
          <motion.button
            key={view}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDataView(view as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: dataView === view ? theme.palette.primary.main : alpha(theme.palette.background.paper, 0.8),
              color: dataView === view ? 'white' : theme.palette.text.primary,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {view}
          </motion.button>
        ))}
      </Box>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {dataView === 'galaxy' ? (
          <motion.div
            key="galaxy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: '100vh' }}
          >
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              
              {categoryData.map((data) => (
                <CategorySphere
                  key={data.id}
                  data={data}
                  isSelected={selectedCategory?.id === data.id}
                />
              ))}
            </Canvas>
            
            {/* Selected Category Details */}
            {selectedCategory && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 120,
                  bottom: 0,
                  width: 400,
                  background: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(20px)',
                  borderLeft: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  padding: 24,
                  overflowY: 'auto',
                }}
              >
                <IconButton
                  onClick={() => setSelectedCategory(null)}
                  sx={{ position: 'absolute', right: 16, top: 16 }}
                >
                  ×
                </IconButton>
                
                <Typography variant="h4" sx={{ mb: 3, color: selectedCategory.color }}>
                  {selectedCategory.name}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Market Size</Typography>
                  <Typography variant="h5">${(selectedCategory.marketSize / 1000000).toFixed(1)}M</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Growth Rate</Typography>
                  <Typography variant="h5" sx={{ color: theme.palette.success.main }}>
                    {selectedCategory.growth.toFixed(1)}%
                  </Typography>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2 }}>Procedures</Typography>
                
                {sortedData.map((procedure, index) => (
                  <motion.div
                    key={procedure.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        background: alpha(selectedCategory.color, 0.05),
                        border: `1px solid ${alpha(selectedCategory.color, 0.2)}`,
                      }}
                    >
                      <Typography variant="subtitle1">{procedure.name}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption">
                          Revenue: ${(procedure.revenue / 1000000).toFixed(2)}M
                        </Typography>
                        <Typography variant="caption">
                          Growth: {procedure.growth}%
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : dataView === 'matrix' ? (
          <motion.div
            key="matrix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MatrixView />
          </motion.div>
        ) : (
          <motion.div
            key="flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Flow view implementation would go here */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h4">Flow View Coming Soon...</Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default QuantumMarketDashboard;