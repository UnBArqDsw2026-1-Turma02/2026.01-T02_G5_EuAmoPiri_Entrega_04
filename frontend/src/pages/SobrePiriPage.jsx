import React from 'react';
import './SobrePiriPage.css';

import piriImagem1 from '../assets/piriimagem1.png';
import piriImagem2 from '../assets/piriimagem2.png';
import piriImagem3 from '../assets/piriimagem3.png';
import piriImagem4 from '../assets/piriimagem4.png';
import piriImagem5 from '../assets/piriimagem5.png';
import piriImagem6 from '../assets/piriimagem6.png';

export default function SobrePiriPage() {
  return (
    <div className="sobre-piri-container">
      
      <header className="header-piri">
        <div className="logo"> ❤︎ EuAmoPiri</div>
        <button className="btn-amopiri">← Voltar</button>
      </header>

      <section className="card-box card-horizontal">
        <div className="conteudo-texto">
          <h2>Origem da cidade de Pirenópolis</h2>
          <p>
            Pirenópolis foi founded em 1727, durante o ciclo do ouro, quando bandeirantes 
            chegaram à região em busca de riquezas minerais. O local ficou conhecido como Meia Ponte, 
            tornando-se um importante arraial de garimpo. O crescimento foi rápido, impulsionado pela 
            exploração do ouro e pela chegada de novos moradores. Com o passar do tempo, a região 
            começou a se estruturar com a construção de igrejas, casarões e ruas de pedra, formando 
            a base do atual centro histórico. A religiosidade teve forte influência no desenvolvimento 
            local, marcada por celebrações e tradições que permanecem até hoje.
          </p>
        </div>
        <div className="galeria-fotos-principal">
          <img src={piriImagem1} alt="Casario Histórico 1" className="foto-piri" />
          <img src={piriImagem2} alt="Casario Histórico 2" className="foto-piri foto-vertical" />
        </div>
      </section>

      <div className="grid-inferior">
        
        <section className="card-box card-vertical">
          <h2>História</h2>
          <p>
            Com o esgotamento do ouro, no final do século XVIII, a cidade passou por uma mudança econômica, 
            voltando-se para a agricultura, pecuária e comércio. Em 1890, recebeu o nome de Pirenópolis, 
            inspirado na Serra dos Pireneus. Mesmo com essas mudanças, preservou sua arquitetura colonial 
            e tradições culturais ao longo dos anos.
          </p>
          <div className="fotos-lado-a-lado">
        
            <img src={piriImagem3} alt="Igreja Matriz" className="foto-piri" />
            <img src={piriImagem4} alt="Rua Histórica" className="foto-piri" />
          </div>
        </section>

        <section className="card-box card-vertical">
          <h2>Atualidade</h2>
          <p>
            Atualmente, Pirenópolis é um dos destinos turísticos mais procurados de Goiás. A cidade se destaca 
            por seu centro histórico preservado, suas cachoeiras e paisagens naturais, além de festas 
            tradicionais como as Cavalhadas, que reforçam sua identidade cultural e histórica.
          </p>
          <div className="fotos-lado-a-lado">
          
            <img src={piriImagem5} alt="Cachoeira" className="foto-piri" />
            <img src={piriImagem6} alt="Cavalhadas" className="foto-piri" />
          </div>
        </section>

      </div>

    </div>
  );
}