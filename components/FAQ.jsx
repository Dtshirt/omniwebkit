// components/FAQ.jsx
"use client";

import { useState } from "react";
import Script from "next/script";

const DEFAULT_ITEMS = [
  {
    question: "What is Next.js and why should I use it?",
    answer:
      "Next.js is a React framework that enables server-side rendering, static site generation, and full-stack features out of the box. It improves performance, SEO, and developer experience compared to plain React apps.",
  },
  {
    question: "Does this FAQ component support SEO?",
    answer:
      "Yes! This component automatically injects a JSON-LD FAQPage schema using Next.js's Script component, which helps search engines like Google display your FAQ in rich results.",
  },
  {
    question: "Can I add or remove questions easily?",
    answer:
      "Absolutely. Just pass your own items array as a prop. Each item needs a question and an answer string — the component handles the rest automatically.",
  },
  {
    question: "Is this component accessible?",
    answer:
      "Yes. It uses semantic HTML with proper ARIA attributes (aria-expanded, aria-controls, role='region') to ensure screen readers and keyboard users have a great experience.",
  },
  {
    question: "Does it support dark mode?",
    answer:
      "Yes! The component uses Tailwind's dark: variant. It automatically adapts when your html element has the 'dark' class, following Tailwind's class-based dark mode strategy.",
  },
];

function buildSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

function ChevronIcon({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 flex-shrink-0 ${
        open
          ? "rotate-180 text-indigo-500"
          : "rotate-0 text-slate-400 dark:text-slate-500"
      }`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FAQItem({ item, index, isOpen, onToggle }) {
  const id = `faq-answer-${index}`;
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden
        ${
          isOpen
            ? "border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:shadow-indigo-900/30"
            : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-indigo-500/40"
        }`}
    >
      {/* Question Button */}
      <button
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold tracking-wider px-2 py-1 rounded-md flex-shrink-0 transition-colors duration-300 ${
              isOpen
                ? "bg-indigo-500 text-white"
                : "bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-[15px] font-semibold leading-snug transition-colors duration-200 ${
              isOpen
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {item.question}
          </span>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Answer */}
      <div
        id={id}
        role="region"
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 pl-[60px] text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ({
  items = DEFAULT_ITEMS,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know. Can't find an answer?",
  contactEmail = "hello@example.com",
}) {
  const [openIndex, setOpenIndex] = useState(null);
  const schemaData = buildSchema(items);
  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <>
      {/* JSON-LD Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <section className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center py-20 px-4">
        <div className="max-w-2xl w-full mx-auto">

          {/* Header */}
          <div className="text-center mb-2">
            <span className="inline-block text-xs font-bold tracking-[3px] uppercase text-white bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              {subtitle}{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-indigo-500 dark:text-indigo-400 font-medium hover:underline underline-offset-2 transition-colors"
              >
                Contact us.
              </a>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {items.length} questions
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* FAQ Items */}
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={toggle}
              />
            ))}
          </div> 
        </div>
      </section>
    </>
  );
}