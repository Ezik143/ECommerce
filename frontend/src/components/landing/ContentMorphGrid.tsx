import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Gem, Palette, Globe, Shield, Leaf } from 'lucide-react'

interface GridItem {
  id: string
  title: string
  description: string
  icon: typeof Sparkles
  color: string
  gradient: string
}

const gridItems: GridItem[] = [
  {
    id: 'artisan',
    title: 'Artisan Collection',
    description: 'Handcrafted pieces from master artisans, each bearing the unique touch of its creator. From ceramic vessels to woven textiles, every object carries centuries of tradition.',
    icon: Sparkles,
    color: '#D4A373',
    gradient: 'from-[#D4A373]/20 to-transparent',
  },
  {
    id: 'gold',
    title: 'Gold & Precious',
    description: 'Curated selection of gold-accented objects and fine jewelry. Each piece authenticated and certified, blending contemporary design with ancient techniques.',
    icon: Gem,
    color: '#E0B88C',
    gradient: 'from-[#E0B88C]/20 to-transparent',
  },
  {
    id: 'ceramics',
    title: 'Ceramics & Pottery',
    description: 'Wheel-thrown and hand-built ceramics from studios across the globe. Earthy glazes, organic forms, and the quiet beauty of functional art.',
    icon: Palette,
    color: '#B8875A',
    gradient: 'from-[#B8875A]/20 to-transparent',
  },
  {
    id: 'textiles',
    title: 'Textiles & Weaves',
    description: 'Handwoven textiles using natural dyes and traditional looms. Scarves, tapestries, and home goods that tell stories through pattern and thread.',
    icon: Globe,
    color: '#A0522D',
    gradient: 'from-[#A0522D]/20 to-transparent',
  },
  {
    id: 'woodcraft',
    title: 'Wood & Heritage',
    description: 'Sustainably sourced wooden objects carved, turned, and finished by hand. Furniture, utensils, and sculptures that honor the grain and the maker.',
    icon: Shield,
    color: '#8B6F47',
    gradient: 'from-[#8B6F47]/20 to-transparent',
  },
  {
    id: 'sustainable',
    title: 'Sustainable Luxury',
    description: 'Our commitment to ethical luxury: carbon-neutral shipping, plastic-free packaging, and direct partnerships that ensure fair wages for every maker.',
    icon: Leaf,
    color: '#6B8E5A',
    gradient: 'from-[#6B8E5A]/20 to-transparent',
  },
]

export function ContentMorphGrid() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-text-primary font-heading text-[clamp(2rem,4vw,3.5rem)] font-normal italic text-center mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Discover our world
        </motion.h2>
        <motion.p
          className="text-text-muted font-body text-center mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Hover to explore each collection
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gridItems.map((item, index) => {
            const isExpanded = expandedId === item.id
            const Icon = item.icon

            return (
              <motion.div
                key={item.id}
                layout
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: isExpanded ? item.color + '40' : 'var(--color-text-muted)',
                  borderWidth: 1,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onHoverStart={() => setExpandedId(item.id)}
                onHoverEnd={() => setExpandedId(null)}
              >
                <motion.div
                  layout
                  className="p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      layout
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: item.color + '20' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </motion.div>
                    <motion.span
                      layout
                      className="text-text-muted/30 font-heading text-3xl italic"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </motion.span>
                  </div>
                  <motion.h3
                    layout
                    className="text-text-primary font-body font-semibold text-lg mb-2"
                  >
                    {item.title}
                  </motion.h3>
                  <AnimatePresence mode="sync">
                    {isExpanded && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-text-muted font-body text-sm leading-relaxed"
                      >
                        {item.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    opacity: isExpanded ? 1 : 0,
                    background: isExpanded
                      ? `linear-gradient(135deg, ${item.color}08, transparent 60%)`
                      : 'transparent',
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
