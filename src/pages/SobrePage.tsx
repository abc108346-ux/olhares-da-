import React from 'react';
import { Instagram, ArrowUpRight, BookOpen, Feather, Theater, Sparkles } from 'lucide-react';
import { Logo } from '../components/Logo';

interface SobrePageProps {
  onNavigate: (path: string) => void;
}

export const SobrePage: React.FC<SobrePageProps> = ({ onNavigate }) => {
  return (
    <div id="sobre-page" className="min-h-screen bg-black text-white space-y-16 pb-24">
      
      {/* Header section */}
      <section className="border-b border-zinc-900 bg-zinc-950 pt-12 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black border border-zinc-800 text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-400">
            PROJETO EDITORIAL & MANIFESTO
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase">
            SOBRE O PROJETO
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl text-zinc-300 font-light leading-relaxed">
            “Olhares da Cena é um espaço dedicado à crítica e reflexão sobre as artes cênicas.”
          </p>
        </div>
      </section>

      {/* Main Content Article */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Editorial Photo Frame */}
        <div className="border border-zinc-850 bg-zinc-950 overflow-hidden space-y-2">
          <img
            src="https://blogger.googleusercontent.com/img/a/AVvXsEhElA3KqcSpB1S-r4XP-FkCjJEjxjOLu0stZo9jyNzaKsom_FKQtibjmxUTU-WyYpJvyCAqWk-gCSF9-TC0X8AihtdD8nz6UTpM_PLcqEY1wUGxVm4RPqqASBiIgM-RuB5dtoYwf4BlLAoMa0zEFDUiL2wLcODiESPk7Y6RltvXOR7579sZqUb_t4gtcn2O=s910"
            alt="Olhares da Cena - Espaço de Reflexão Cênica"
            className="w-full h-80 sm:h-96 object-cover object-center grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
          />
          <p className="p-3 text-center font-mono text-xs text-zinc-500 italic">
            Arquivo cênico, dramaturgia e reflexão crítica sobre a produção teatral brasileira.
          </p>
        </div>

        {/* Text Body */}
        <div className="prose prose-invert max-w-none text-zinc-300 font-serif leading-[1.8] text-base sm:text-lg font-light space-y-6">
          <p>
            O <strong>Olhares da Cena</strong> surge da necessidade premente de cultivar um espaço contínuo, 
            independente e aprofundado de mediação crítica entre a cena teatral e o público. Longe de reduzir o exercício crítico a notas arbitrárias ou julgamentos publicitários, nosso propósito é documentar, interrogar e tensionar as linguagens artísticas em sua multiplicidade.
          </p>

          <blockquote className="my-8 pl-6 border-l-2 border-white italic font-serif text-xl sm:text-2xl text-zinc-100 bg-zinc-950/60 py-4 pr-4 font-normal">
            “Pensar a cena é pensar o tempo histórico, o corpo presente, a memória coletiva e as fricções estéticas que nos constituem.”
          </blockquote>

          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight pt-4 border-b border-zinc-900 pb-2">
            Eixos de Investigação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-6 font-sans">
            <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-2">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
                <Theater className="w-5 h-5 text-zinc-400" />
                Teatro & Dramaturgia
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Análise de encenações, textos clássicos e dramaturgias inéditas, com ênfase na poética dos atores e na arquitetura espacial.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-2">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
                <Sparkles className="w-5 h-5 text-zinc-400" />
                Dança & Performance
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Reflexões sobre o corpo em movimento, coreografia expandida, intervenções urbanas e as fronteiras do ato performático.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-2">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
                <Feather className="w-5 h-5 text-zinc-400" />
                Processos Criativos
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Ensaios sobre métodos de criação, dramaturgias colaborativas, cenotécnica, iluminação e paisagens sonoras contemporâneas.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-850 space-y-2">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
                <BookOpen className="w-5 h-5 text-zinc-400" />
                Arquivo & Memória
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Construção de uma memória crítica acessível, catalogando fichas técnicas completas e registros históricos da cena.
              </p>
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight pt-4 border-b border-zinc-900 pb-2">
            Acompanhe Nossas Publicações
          </h2>

          <p>
            Publicamos críticas regulares, coberturas de mostras e festivais cênicos. Para manter contato contínuo ou sugerir pautas e temporadas:
          </p>
        </div>

        {/* Social Connection Card */}
        <div className="p-8 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-display tracking-[0.2em] text-white font-bold text-base uppercase">
              INSTAGRAM OFICIAL
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              @olharesdacena • Publicações, debates e notícias cênicas
            </p>
          </div>

          <a
            id="sobre-instagram-cta"
            href="https://www.instagram.com/olharesdacena/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-white text-black font-semibold uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Instagram className="w-4 h-4" />
            <span>SEGUIR NO INSTAGRAM</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </section>

    </div>
  );
};
