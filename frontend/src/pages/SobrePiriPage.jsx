import { useState } from 'react';

import piriImagem1 from '../assets/piriimagem1.png';
import piriImagem2 from '../assets/piriimagem2.png';
import piriImagem3 from '../assets/piriimagem3.png';
import piriImagem4 from '../assets/piriimagem4.png';
import piriImagem5 from '../assets/piriimagem5.png';
import piriImagem6 from '../assets/piriimagem6.png';
import styles from './SobrePiriPage.module.css';

const SECOES = ['origem', 'historia', 'atualidade'];
const SECAO_LABELS = { origem: 'Origem', historia: 'História', atualidade: 'Atualidade' };

export default function SobrePiriPage() {
  const [secaoAtiva, setSecaoAtiva] = useState('origem');
  const idx = SECOES.indexOf(secaoAtiva);

  return (
    <div className={styles.page}>

      <nav className={styles.tabs} aria-label="Seções sobre Pirenópolis">
        {SECOES.map((s) => (
          <button
            key={s}
            className={[styles.tab, secaoAtiva === s ? styles.tabAtiva : ''].join(' ')}
            onClick={() => setSecaoAtiva(s)}
            aria-current={secaoAtiva === s ? 'page' : undefined}
          >
            {SECAO_LABELS[s]}
          </button>
        ))}
      </nav>

      <div className={styles.container}>

        <section
          className={[
            styles.cardHorizontal,
            secaoAtiva !== 'origem' ? styles.secaoOculta : '',
          ].join(' ')}
          aria-labelledby="origem-titulo"
        >
          <div className={styles.texto}>
            <h2 id="origem-titulo" className={styles.titulo}>
              Origem da cidade de Pirenópolis
            </h2>
            <p className={styles.paragrafo}>
              Pirenópolis foi fundada em 1727, durante o ciclo do ouro, quando bandeirantes
              chegaram à região em busca de riquezas minerais. O local ficou conhecido como
              Meia Ponte, tornando-se um importante arraial de garimpo. O crescimento foi
              rápido, impulsionado pela exploração do ouro e pela chegada de novos moradores.
              Com o passar do tempo, a região começou a se estruturar com a construção de
              igrejas, casarões e ruas de pedra, formando a base do atual centro histórico.
              A religiosidade teve forte influência no desenvolvimento local, marcada por
              celebrações e tradições que permanecem até hoje.
            </p>
          </div>
          <div className={styles.galeria}>
            <img src={piriImagem1} alt="Casarão histórico de Pirenópolis" className={styles.fotoA} />
            <img src={piriImagem2} alt="Casarão histórico de Pirenópolis" className={styles.fotoB} />
          </div>
        </section>

        <div className={styles.grid}>

          <section
            className={[
              styles.card,
              secaoAtiva !== 'historia' ? styles.secaoOculta : '',
            ].join(' ')}
            aria-labelledby="historia-titulo"
          >
            <h2 id="historia-titulo" className={styles.titulo}>História</h2>
            <p className={styles.paragrafo}>
              Com o esgotamento do ouro, no final do século XVIII, a cidade passou por uma
              mudança econômica, voltando-se para a agricultura, pecuária e comércio. Em 1890,
              recebeu o nome de Pirenópolis, inspirado na Serra dos Pireneus. Mesmo com essas
              mudanças, preservou sua arquitetura colonial e tradições culturais ao longo dos anos.
            </p>
            <div className={styles.fotosLadoALado}>
              <img src={piriImagem3} alt="Igreja Matriz de Pirenópolis" className={styles.fotoGrid} />
              <img src={piriImagem4} alt="Rua histórica de Pirenópolis" className={[styles.fotoGrid, styles.fotoGridOffset].join(' ')} />
            </div>
          </section>

          <section
            className={[
              styles.card,
              secaoAtiva !== 'atualidade' ? styles.secaoOculta : '',
            ].join(' ')}
            aria-labelledby="atualidade-titulo"
          >
            <h2 id="atualidade-titulo" className={styles.titulo}>Atualidade</h2>
            <p className={styles.paragrafo}>
              Atualmente, Pirenópolis é um dos destinos turísticos mais procurados de Goiás.
              A cidade se destaca por seu centro histórico preservado, suas cachoeiras e paisagens
              naturais, além de festas tradicionais como as Cavalhadas, que reforçam sua
              identidade cultural e histórica.
            </p>
            <div className={styles.fotosLadoALado}>
              <img src={piriImagem5} alt="Cachoeira em Pirenópolis" className={styles.fotoGrid} />
              <img src={piriImagem6} alt="Cavalhadas de Pirenópolis" className={[styles.fotoGrid, styles.fotoGridOffset].join(' ')} />
            </div>
          </section>

        </div>

        <div className={styles.navBotoes}>
          <button
            className={styles.navBtn}
            onClick={() => setSecaoAtiva(SECOES[idx - 1])}
            disabled={idx === 0}
            aria-label="Seção anterior"
          >
            Anterior
          </button>
          <span className={styles.navIndicador}>
            {idx + 1} / {SECOES.length}
          </span>
          <button
            className={styles.navBtn}
            onClick={() => setSecaoAtiva(SECOES[idx + 1])}
            disabled={idx === SECOES.length - 1}
            aria-label="Próxima seção"
          >
            Próximo
          </button>
        </div>

      </div>
    </div>
  );
}
