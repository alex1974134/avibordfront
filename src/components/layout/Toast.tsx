import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'

export function Toast() {
  const toast = useAppStore((state) => state.toast)
  const dismissToast = useAppStore((state) => state.dismissToast)

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60]">
      <AnimatePresence>
        {toast ? (
          <motion.button
            key={toast.id}
            type="button"
            onClick={dismissToast}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto cursor-pointer rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white shadow-lg"
          >
            {toast.message}
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
