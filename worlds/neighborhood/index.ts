/**
 * Neighborhood Worlds - Main Export
 * Registers all world routers into Express
 */

import { Router } from 'express';
import emergencyRouter from './emergency/routes/emergency.routes';
import juryRouter from './jury/routes/jury.routes';
import groupBuyRouter from './group-buy/routes/group-buy.routes';
import skillSwapRouter from './skill-swap/routes/skill-swap.routes';
import communityRouter from './community/routes/community.routes';

const neighborhoodRouter = Router();

// Mount all world routers
neighborhoodRouter.use('/emergency', emergencyRouter);
neighborhoodRouter.use('/jury', juryRouter);
neighborhoodRouter.use('/group-buy', groupBuyRouter);
neighborhoodRouter.use('/skill-swap', skillSwapRouter);
neighborhoodRouter.use('/community', communityRouter);

// Health check
neighborhoodRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    worlds: ['emergency', 'jury', 'group-buy', 'skill-swap', 'community'],
    timestamp: new Date().toISOString(),
  });
});

export default neighborhoodRouter;
export {
  emergencyRouter,
  juryRouter,
  groupBuyRouter,
  skillSwapRouter,
  communityRouter,
};