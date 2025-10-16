import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import usuarioRoutes from './routes/usuarioRoutes';
import especialidadeRoutes from './routes/especialidadeRoutes';
import authRoutes from './routes/authRoutes';
import profissionalRoutes from './routes/profissionalRoutes';
import agendamentoRoutes from './routes/agendamentoRoutes';


dotenv.config(); // Carrega variáveis do .env

const app = express();
const prisma = new PrismaClient();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas protegidas e públicas
app.use('/api/usuarios', usuarioRoutes);          
app.use('/api/especialidades', especialidadeRoutes); 
app.use('/api/auth', authRoutes);   
app.use('/api/profissionais', profissionalRoutes);  
app.use('/api/agendamentos', agendamentoRoutes);           

// Healthcheck
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando' });
});

// Rota raiz
app.get('/', (req, res) => {
  res.send('API do Sistema de Agendamento - v1');
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});

// Encerra conexão do Prisma em caso de interrupção (Ctrl+C, etc.)
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
