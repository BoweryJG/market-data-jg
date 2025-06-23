#!/bin/bash

# Automated Enrichment Runner
# This script will run the enrichment process continuously until all procedures are done

echo "=== AUTOMATED PROCEDURE ENRICHMENT ==="
echo "This will run for several hours to enrich ALL procedures"
echo ""

# Check if user wants to proceed
read -p "Do you want to start the automated enrichment? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Starting enrichment process..."
    echo "You can close this terminal and the process will continue"
    echo "Check progress in: AUTOMATED_ENRICHMENT_PROGRESS.log"
    echo ""
    
    # Run in background with nohup
    nohup npm run enrich:automated > AUTOMATED_ENRICHMENT_PROGRESS.log 2>&1 &
    
    echo "Process started with PID: $!"
    echo "To check progress: tail -f AUTOMATED_ENRICHMENT_PROGRESS.log"
    echo "To stop: kill $!"
else
    echo "Enrichment cancelled"
fi