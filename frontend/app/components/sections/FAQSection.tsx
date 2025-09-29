'use client';

import { useState } from 'react';

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="py-6 md:py-8 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 text-orange-400">
            <span className="text-2xl">❓</span>
            <span className="text-sm font-medium tracking-wider uppercase">Frequently Asked</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Got Questions?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about blockchain event ticketing
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {[
            {
              question: "How do NFT tickets work?",
              answer: "NFT tickets are unique digital assets stored on the blockchain. Each ticket contains event details, seat information, and ownership verification. They're transferable, verifiable, and cannot be duplicated or counterfeited."
            },
            {
              question: "Are my tickets secure?",
              answer: "Absolutely. All tickets are minted as NFTs on the blockchain, making them immutable and tamper-proof. You maintain full ownership and can transfer them securely to anyone."
            },
            {
              question: "What are POAP rewards?",
              answer: "POAP (Proof of Attendance Protocol) rewards are special NFTs you earn by attending events. They serve as digital badges that prove your participation and can be collected in your wallet."
            },
            {
              question: "How do I get started?",
              answer: "Simply connect your wallet, browse events, and purchase tickets with cryptocurrency. The process is seamless and takes just a few minutes."
            },
            {
              question: "What blockchains are supported?",
              answer: "We currently support Ethereum and compatible networks. More blockchain integrations are coming soon to provide even more options for our users."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <span className={`text-2xl text-cyan-400 transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}