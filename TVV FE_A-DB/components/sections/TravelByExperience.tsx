"use client";

import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import type { Experience } from "@/lib/models";
import { motion } from "framer-motion";

interface TravelByExperienceProps {
  experiences: Experience[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 0.61, 0.36, 1],
    },
  },
};

export function TravelByExperience({ experiences }: TravelByExperienceProps) {
  if (!experiences || experiences.length === 0) return null;
  return (
    <Section tone="white" pad="default" className="overflow-hidden">
      <Container>
        <SectionHeader
          eyebrow="Travel by experience"
          title="The way you travel, not the place you go."
          description="Pick a thread — honeymoon, adventure, slow wellness, food — and we'll route a journey around it."
          viewAllHref="/experiences"
          viewAllLabel="All experiences"
        />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="-mx-5 flex gap-5 overflow-x-auto scroll-rail px-5 pb-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4"
        >
          {experiences.map((e) => (
            <motion.div variants={itemVariants} key={e.slug} className="w-[270px] shrink-0 sm:w-auto">
              <ExperienceCard experience={e} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
