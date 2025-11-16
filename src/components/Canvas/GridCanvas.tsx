import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';

export default function GridCanvas() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <Grid3x3 size={40} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Grid View
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Grid layout coming soon. Switch to Freeform mode to start creating!
        </p>
      </div>
    </motion.div>
  );
}
