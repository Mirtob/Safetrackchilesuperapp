import { Logo } from '@/app/components/Logo';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({ 
  message = 'Cargando SafeTrack Chile...', 
  submessage 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950">
      <div className="text-center">
        {/* Logo con animación de rotación */}
        <div className="mb-8 flex justify-center">
          <Logo size={120} animate="spin" />
        </div>

        {/* Mensaje principal */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
        >
          {message}
        </motion.h2>

        {/* Submensaje opcional */}
        {submessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 dark:text-zinc-400 mb-8"
          >
            {submessage}
          </motion.p>
        )}

        {/* Barra de progreso animada */}
        <div className="w-64 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ width: '50%' }}
          />
        </div>

        {/* Puntos animados */}
        <motion.div
          className="mt-4 flex gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
