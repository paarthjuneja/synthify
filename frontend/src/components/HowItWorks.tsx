"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";

const content = [
  {
    title: "1. Contribute Securely",
    description:
      "Hospitals run our standalone synthesizer on-premise. Raw patient data is used to generate a new, synthetic dataset locally. The original, sensitive data never leaves their secure environment.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        On-Premise Synthesis
      </div>
    ),
  },
  {
    title: "2. Aggregate & Enhance",
    description:
      "Admins upload the safe, synthetic data to the Synthify platform. We aggregate these contributions into a massive, diverse, and statistically rich central database, ready for analysis.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white">
        <p className="text-4xl font-bold">Centralized Database</p>
      </div>
    ),
  },
  {
    title: "3. Analyze & Predict",
    description:
      "Researchers request custom datasets based on specific criteria. They can then interact with the timelines, running predictive 'what-if' scenarios to uncover new insights and accelerate discovery.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        Interactive Analysis
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <div className="p-10">
      <StickyScroll content={content} />
    </div>
  );
}