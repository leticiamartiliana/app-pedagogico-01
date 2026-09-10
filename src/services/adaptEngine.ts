import { AdaptedActivity, NeuroType } from '../types';
import { NEURO_MAP } from '../constants/neuroTypes';

export interface AdaptParams {
  originalActivity: string;
  neurodivergenceType: NeuroType;
  subject?: string;
  gradeLevel?: string;
  studentAlias?: string;
  extraInstructions?: string;
}

/**
 * Intelligent client-side pedagogical fallback adaptation engine.
 * Ensures the educator can adapt materials even completely offline without server or internet!
 */
export function generateOfflineAdaptation(params: AdaptParams): Omit<AdaptedActivity, 'id' | 'createdAt' | 'updatedAt'> {
  const meta = NEURO_MAP.get(params.neurodivergenceType);
  const neuroName = meta?.name || 'Neurodivergência';
  const original = params.originalActivity.trim();

  // Extract paragraphs and lines
  const rawLines = original
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const titleLine = rawLines[0] || 'Atividade Adaptada';
  const cleanTitle = titleLine.replace(/^(leia|atividade|texto|exercício)[:\-]?\s*/i, '');

  switch (params.neurodivergenceType) {
    case 'tea': {
      return {
        title: `Roteiro Visual Estruturado: ${cleanTitle}`,
        originalText: original,
        neurodivergence: 'tea',
        subject: params.subject || 'Educação Inclusiva',
        gradeLevel: params.gradeLevel || 'Geral',
        studentAlias: params.studentAlias,
        isAiGenerated: false,
        visualInstructions: [
          'Passo 1: Leia a etapa 1 com calma e atenção.',
          'Passo 2: Observe as informações diretas sem figuras de linguagem.',
          'Passo 3: Marque um check [✔] ao terminar cada pergunta.',
          'Passo 4: Entregue a folha ou avise o professor que concluiu.'
        ],
        adaptedContent: `### Roteiro Estruturado de Aprendizagem
📌 **Objetivo:** Compreender os pontos essenciais de forma clara e objetiva.

${rawLines.map((line, idx) => `**Etapa ${idx + 1}:** ${line}`).join('\n\n')}

---
**Importante:** Cada pergunta a seguir possui apenas 1 resposta correta e termos diretos.`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Qual é o assunto principal apresentado no texto acima?',
            options: [
              `O tema central é: ${cleanTitle}`,
              'Um assunto completamente diferente',
              'Não é possível saber pelo texto'
            ],
            hint: 'Olhe a primeira frase da atividade.',
            visualSupportNote: 'Dica: A resposta está escrita de forma idêntica no início.'
          },
          {
            number: 2,
            question: 'O que a instrução principal pede para você realizar?',
            options: [
              'Seguir o passo a passo com atenção',
              'Fazer tudo correndo sem ler',
              'Fechar a folha sem responder'
            ],
            hint: 'Veja o Passo 1 no checklist acima.'
          }
        ],
        pedagogicalJustification: 'Adaptação baseada nos princípios TEACCH para o Transtorno do Espectro Autista (TEA): rotina visual sequencial de 4 passos, eliminação de duplo sentido, diagramação espaçada e previsibilidade explícita de começo, meio e fim.',
        sensoryTips: [
          'Forneça um marcador ou régua de leitura para isolar cada linha.',
          'Avise com 3 minutos de antecedência antes de trocar de atividade.',
          'Permita o uso de fones antirruído se houver barulho externo.'
        ]
      };
    }

    case 'tdah': {
      return {
        title: `Missão Foco Rápido: ${cleanTitle} ⚡`,
        originalText: original,
        neurodivergence: 'tdah',
        subject: params.subject || 'Educação Inclusiva',
        gradeLevel: params.gradeLevel || 'Geral',
        studentAlias: params.studentAlias,
        isAiGenerated: false,
        visualInstructions: [
          '🎯 Checkpoint 1: Encontre as palavras em NEGRITO (2 minutos)',
          '🎯 Checkpoint 2: Responda a pergunta relâmpago (3 minutos)',
          '🎯 Checkpoint 3: Marque seu troféu de vitória!'
        ],
        adaptedContent: `### Desafio por Fases Gamificadas 🎮
- **Fase 1 (O Que Saber):**
${rawLines.map((l) => `  👉 **Foco:** ${l}`).join('\n')}

- **Fase 2 (Super-Destaque):**
  - Informações-chave divididas em blocos curtos para rápida absorção.
  - Evite ler tudo de uma vez: faça uma pausa de 30 segundos entre os blocos!`,
        interactiveQuestions: [
          {
            number: 1,
            question: '⚡ Pergunta Relâmpago 1: Qual elemento tem maior destaque?',
            options: [
              'A ideia principal em negrito',
              'Um detalhe sem importância',
              'Nenhuma das alternativas'
            ],
            hint: 'Procure a palavra que mais chama a atenção no texto.',
          },
          {
            number: 2,
            question: '⚡ Pergunta Relâmpago 2: Concluiu esta etapa com sucesso?',
            options: ['🏆 Sim, cumpri a missão!', 'Preciso de mais 1 minuto de foco'],
            hint: 'Respire fundo e celebre seu progresso.',
          }
        ],
        pedagogicalJustification: 'Adaptação estruturada com a metodologia de "chunking" (fragmentação) e gamificação para TDAH: redução de esforço de memória de trabalho através de marcadores visuais, negrito seletivo e pausas ativas.',
        sensoryTips: [
          'Permita movimentação ou uso de objetos sensoriais (fidget toy) durante a leitura.',
          'Defina um cronômetro visual em contagem regressiva.',
          'Incentive auto-reforço positivo a cada checklist marcado.'
        ]
      };
    }

    case 'dyslexia': {
      return {
        title: `Leitura Acessível e Clara: ${cleanTitle}`,
        originalText: original,
        neurodivergence: 'dyslexia',
        subject: params.subject || 'Educação Inclusiva',
        gradeLevel: params.gradeLevel || 'Geral',
        studentAlias: params.studentAlias,
        isAiGenerated: false,
        visualInstructions: [
          '📖 Passo 1: Ouça o áudio em voz alta usando o botão do Leitor de Tela.',
          '📖 Passo 2: Acompanhe com o dedo ou régua de leitura.',
          '📖 Passo 3: Escolha a resposta com palavras simples.'
        ],
        adaptedContent: `### Texto com Espaçamento Amplo e Frases Diretas
${rawLines
  .map(
    (l) =>
      `• ${l
        .split('. ')
        .map((sentence) => sentence.trim())
        .filter((s) => s.length > 0)
        .join('.\n\n• ')}`
  )
  .join('\n\n')}`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Sobre o que o texto está nos informando?',
            options: [
              `Fala sobre ${cleanTitle}`,
              'Fala sobre algo diferente',
              'Não explica nada'
            ],
            hint: 'Você pode apertar o botão de áudio para ouvir a pergunta!',
          }
        ],
        pedagogicalJustification: 'Adaptação para Dislexia com quebras frequentes de linha, abolição de textos justificados em bloco, redução da densidade lexical e integração com o leitor de tela (TTS) para aliviar a sobrecarga da decodificação grafema-fonema.',
        sensoryTips: [
          'Utilize fonte Lexend ou OpenDyslexic com fundo creme/sépia.',
          'Incentive a audição do texto antes da leitura autônoma.',
          'Aceite respostas gravadas em áudio ou explicadas oralmente.'
        ]
      };
    }

    case 'dyscalculia': {
      return {
        title: `Matemática Concreta e Visual: ${cleanTitle}`,
        originalText: original,
        neurodivergence: 'dyscalculia',
        subject: params.subject || 'Matemática e Raciocínio',
        gradeLevel: params.gradeLevel || 'Geral',
        studentAlias: params.studentAlias,
        isAiGenerated: false,
        visualInstructions: [
          '🔢 Passo 1: Represente as quantidades com objetos, desenhos ou blocos.',
          '🔢 Passo 2: Separe o que você TEM e o que você precisa DESCOBRIR.',
          '🔢 Passo 3: Use cores diferentes para cada número do problema.'
        ],
        adaptedContent: `### Guia Visual do Problema Matemático
- 🟦 **Dados em Azul (O que já temos):**
${rawLines.map((l) => `  * ${l}`).join('\n')}

- 🟩 **Passo a Passo com Apoio Visual:**
  1. Identifique os números envolvidos na situação.
  2. Desenhe ou use contadores (bolinhas/moedas) para representar os valores.
  3. Realize a conta com calma usando a reta numérica de apoio.`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Qual é o primeiro passo para resolver este desafio?',
            options: [
              'Separar os números e desenhar as quantidades',
              'Tentar adivinhar sem calcular',
              'Desistir antes de desenhar'
            ],
            hint: 'Lembre-se: ver os números como objetos reais ajuda a entender a conta.',
          }
        ],
        pedagogicalJustification: 'Adaptação para Discalculia: transposição de notações numéricas abstratas para representações concretas e icônicas, estruturação cromática de etapas operacionais e eliminação de pressão temporal.',
        sensoryTips: [
          'Tenha material dourado, tampinhas ou calculadora sempre à mão.',
          'Forneça folha com quadrículas grandes para armar as contas.',
          'Utilize a régua como apoio visual de reta numérica.'
        ]
      };
    }

    case 'gifted': {
      return {
        title: `Desafio Investigativo & Expansão Criativa: ${cleanTitle} ✨`,
        originalText: original,
        neurodivergence: 'gifted',
        subject: params.subject || 'Educação Inclusiva',
        gradeLevel: params.gradeLevel || 'Geral',
        studentAlias: params.studentAlias,
        isAiGenerated: false,
        visualInstructions: [
          '🚀 Etapa 1: Analise criticamente o texto base.',
          '🚀 Etapa 2: Conecte esta questão a outros campos do conhecimento (ciência, sociedade, arte).',
          '🚀 Etapa 3: Proponha uma solução ou hipótese inédita criada por você.'
        ],
        adaptedContent: `### Laboratório de Ideias e Investigação Profunda
**Texto Base:**
${original}

---
💡 **Provocação de Pensamento Crítico:**
- Em vez de apenas responder o que aconteceu, investigue **POR QUE** e **COMO** esse fenômeno se relaciona com o mundo atual.
- Quais são os desdobramentos éticos, ambientais ou tecnológicos dessa situação?
- Como você explicaria esse conceito para alguém que viveu há 200 anos atrás?`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Se você pudesse transformar este tema em uma invenção ou projeto, o que criaria?',
            options: [
              'Um projeto investigativo ou protótipo inovador',
              'Uma apresentação multimídia para a comunidade',
              'Um ensaio crítico propondo novos rumos'
            ],
            hint: 'Explore seus interesses de maior paixão e conecte com o conteúdo.',
          }
        ],
        pedagogicalJustification: 'Adaptação para Altas Habilidades / Superdotação: elevação na Taxonomia de Bloom (de memorização para análise, avaliação e criação autônoma), fomento à interdisciplinaridade e respeito ao ritmo acelerado de aprendizagem sem sobrecarga de tarefas repetitivas.',
        sensoryTips: [
          'Ofereça acesso a fontes de consulta adicionais e pesquisa aberta.',
          'Permita entrega em formatos variados (podcast, código, modelo 3D).',
          'Estimule o diálogo filosófico e valorize hipóteses não convencionais.'
        ]
      };
    }

    case 'down_syndrome':
    default: {
      return {
        title: `Atividade Prática Passo a Passo: ${cleanTitle} 💙💛`,
        originalText: original,
        neurodivergence: 'down_syndrome',
        subject: params.subject || 'Vida Prática e Inclusão',
        gradeLevel: params.gradeLevel || 'Geral',
        studentAlias: params.studentAlias,
        isAiGenerated: false,
        visualInstructions: [
          '⭐ Passo 1: Olhe para as imagens e palavras simples.',
          '⭐ Passo 2: Faça uma coisa de cada vez com calma.',
          '⭐ Passo 3: Mostre sua resposta com um lindo sorriso!'
        ],
        adaptedContent: `### Aprendendo com Apoio Visual e Prático
${rawLines.map((l) => `👉 **${l}**`).join('\n\n')}

📌 **Ideia Importante do Dia:**
- O que aprendemos aqui serve para o nosso dia a dia em casa e na escola!`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Você conseguiu entender a ideia principal de hoje?',
            options: ['👍 Sim, foi muito legal!', 'Preciso de um pouco de ajuda do professor'],
            hint: 'Aponte com o dedo a figura que você mais gostou.',
          }
        ],
        pedagogicalJustification: 'Adaptação para Síndrome de Down / Deficiência Intelectual: comunicação com linguagem descomplicada, sentenças curtas, foco em aplicabilidade na vida cotidiana e reforço positivo constante.',
        sensoryTips: [
          'Associe cada palavra-chave a uma foto ou objeto palpável.',
          'Dê tempo estendido e acolhedor para a resposta do estudante.',
          'Trabalhe com estímulos táteis e concretos sempre que possível.'
        ]
      };
    }
  }
}

/**
 * Main adapter function that tries the Gemini server endpoint first,
 * and seamlessly falls back to offline engine if offline or error occurs.
 */
export async function adaptActivityService(params: AdaptParams): Promise<AdaptedActivity> {
  // Check if browser is online
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline) {
    try {
      const response = await fetch('/api/adapt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.adaptation) {
          const ad = data.adaptation;
          return {
            id: 'adapt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            title: ad.adaptedTitle || `Atividade Adaptada: ${params.neurodivergenceType}`,
            originalText: params.originalActivity,
            neurodivergence: params.neurodivergenceType,
            subject: params.subject,
            gradeLevel: params.gradeLevel,
            studentAlias: params.studentAlias,
            visualInstructions: Array.isArray(ad.visualInstructions) ? ad.visualInstructions : ['Siga as orientações com atenção.'],
            adaptedContent: ad.adaptedContent || '',
            interactiveQuestions: ad.interactiveQuestions || [],
            pedagogicalJustification: ad.pedagogicalJustification || 'Adaptação personalizada conforme as diretrizes inclusivas.',
            sensoryTips: Array.isArray(ad.sensoryTips) ? ad.sensoryTips : ['Mantenha o ambiente calmo e acolhedor.'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isAiGenerated: true,
          };
        }
      }
    } catch (err) {
      console.warn('Serviço de IA online indisponível. Utilizando motor pedagógico offline...', err);
    }
  }

  // Offline Fallback
  const offlineData = generateOfflineAdaptation(params);
  return {
    ...offlineData,
    id: 'adapt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
