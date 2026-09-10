import { NeuroType, NeurodivergenceMeta } from '../types';

export const NEURO_TYPES_LIST: NeurodivergenceMeta[] = [
  {
    id: 'tea',
    name: 'TEA - Espectro Autista',
    shortName: 'Autismo (TEA)',
    symbol: '♾️',
    tagline: 'Previsibilidade, Estrutura Visual e Clareza Literal',
    description: 'Adaptação com rotina estruturada passo a passo, eliminação de figuras de linguagem dúbias e suporte com pistas visuais concretas.',
    primaryColor: '#EAB308', // Dourado do Infinito Neurodivergente
    accentBg: 'bg-amber-500/20',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-300',
    gradient: 'from-amber-500 to-yellow-400',
    shadowColor: 'shadow-amber-500/40',
    visualSymbolDescription: 'Símbolo do Infinito Dourado',
    keyPedagogy: [
      'Linguagem direta e não ambígua',
      'Checklist de execução com início, meio e fim',
      'Apoio pictográfico e descritivo por etapas',
      'Minimização de sobrecarga sensorial e estímulos concorrentes'
    ],
    classroomTips: [
      'Apresente o produto final esperado antes de iniciar.',
      'Permita pausas programadas sem necessidade de justificativa verbal.',
      'Mantenha a ordem dos exercícios rigorosamente consistente.'
    ]
  },
  {
    id: 'tdah',
    name: 'TDAH - Déficit de Atenção & Hiperatividade',
    shortName: 'TDAH',
    symbol: '⚡',
    tagline: 'Micro-Metas, Gamificação e Destaques Rápidos',
    description: 'Fragmentação da atividade em blocos curtos (chunking), elementos em negrito e checkpoints de progresso visual.',
    primaryColor: '#F97316', // Laranja Cítrico Estimulante
    accentBg: 'bg-orange-500/20',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-300',
    gradient: 'from-orange-500 to-amber-500',
    shadowColor: 'shadow-orange-500/40',
    visualSymbolDescription: 'Raio de Foco e Energia',
    keyPedagogy: [
      'Fragmentação em micro-desafios de 5 a 10 minutos',
      'Palavras-chave e instruções em negrito e com marcadores',
      'Eliminação de enunciados longos e redundantes',
      'Checkboxes de vitória a cada questão concluída'
    ],
    classroomTips: [
      'Use um cronômetro visual ou técnica pomodoro adaptada.',
      'Permita que o aluno use fidgets ou alterne posições enquanto lê.',
      'Divida folhas de atividades para mostrar apenas uma parte por vez.'
    ]
  },
  {
    id: 'dyslexia',
    name: 'Dislexia - Processamento Fonológico e Leitura',
    shortName: 'Dislexia',
    symbol: '📖',
    tagline: 'Espaçamento Otimizado, Apoio Auditivo e Visual',
    description: 'Formatação especial de leitura, frases curtas, separação silábica quando pertinente e suporte direto a leitores de tela.',
    primaryColor: '#06B6D4', // Turquesa / Ciano Vibrante
    accentBg: 'bg-cyan-500/20',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-300',
    gradient: 'from-cyan-500 to-blue-500',
    shadowColor: 'shadow-cyan-500/40',
    visualSymbolDescription: 'Livro com Lente Aumentada',
    keyPedagogy: [
      'Alinhamento à esquerda sem justificação de texto (evita rios de espaço)',
      'Espaçamento duplo entre linhas e palavras',
      'Suporte a Bionic Reading e fontes de alta legibilidade',
      'Substituição de longos textos por infográficos e esquemas visuais'
    ],
    classroomTips: [
      'Priorize a avaliação pelo conteúdo das respostas orais.',
      'Disponibilize a leitura em voz alta digital ou pelo professor.',
      'Evite solicitar leitura em voz alta súbita e desavisada na frente da turma.'
    ]
  },
  {
    id: 'dyscalculia',
    name: 'Discalculia - Raciocínio Matemático e Numérico',
    shortName: 'Discalculia',
    symbol: '🔢',
    tagline: 'Materiais Concretos, Cores Operacionais e Contexto',
    description: 'Conversão de equações abstratas em objetos do dia a dia, passo a passo com cores para cada operação e retas numéricas.',
    primaryColor: '#10B981', // Verde Esmeralda Vibrante
    accentBg: 'bg-emerald-500/20',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/40',
    visualSymbolDescription: 'Blocos Numéricos Concretos',
    keyPedagogy: [
      'Passo a passo com código de cores (ex: Unidades em azul, Dezenas em vermelho)',
      'Associação com dinheiro, culinária e objetos reais cotidianos',
      'Retas numéricas ilustradas em cada problema',
      'Permissão para uso de calculadora e tabuada de apoio visual'
    ],
    classroomTips: [
      'Forneça papel quadriculado de malha ampla para alinhar colunas.',
      'Evite testes matemáticos com limite rígido de tempo.',
      'Ensine a usar a régua como ferramenta visual de adição e subtração.'
    ]
  },
  {
    id: 'gifted',
    name: 'Altas Habilidades / Superdotação (2E)',
    shortName: 'Altas Habilidades',
    symbol: '✨',
    tagline: 'Investigação Profunda, Desafio Aberto e Autonomia',
    description: 'Substituição de exercícios repetitivos por projetos de extensão, perguntas provocativas e conexões multidisciplinares.',
    primaryColor: '#A855F7', // Roxo / Violeta Elétrico
    accentBg: 'bg-purple-500/20',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-300',
    gradient: 'from-purple-500 to-fuchsia-500',
    shadowColor: 'shadow-purple-500/40',
    visualSymbolDescription: 'Constelação de Ideias',
    keyPedagogy: [
      'Perguntas de pensamento crítico e filosófico ("E se...?")',
      'Projetos investigativos de escolha livre do aluno',
      'Aprofundamento conceitual sem aumento de volume mecânico de lição',
      'Conexão com ciência contemporânea, tecnologia e sociedade'
    ],
    classroomTips: [
      'Permita que o aluno aprofunde tópicos de seu interesse especial.',
      'Ofereça opções de entrega em formato livre (podcast, maquete, código).',
      'Acolha o perfeccionismo e acolha dúvidas existenciais com empatia.'
    ]
  },
  {
    id: 'down_syndrome',
    name: 'Síndrome de Down / Deficiência Intelectual',
    shortName: 'S. Down / DI',
    symbol: '💙💛',
    tagline: 'Comunicação Aumentativa, Alta Imagem e Vida Prática',
    description: 'Carga cognitiva reduzida e direta, associação imediata entre imagem e texto e foco em habilidades funcionais para o cotidiano.',
    primaryColor: '#3B82F6', // Azul Real com Toques Amarelos
    accentBg: 'bg-blue-500/20',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-300',
    gradient: 'from-blue-600 via-blue-500 to-yellow-400',
    shadowColor: 'shadow-blue-500/40',
    visualSymbolDescription: 'Coração Azul e Laço Amarelo',
    keyPedagogy: [
      'Uma instrução clara por linha com apoio de pictogramas',
      'Opções de resposta visual com contraste evidente',
      'Foco no uso prático do conhecimento na comunidade',
      'Repetição positiva espaçada com reforço lúdico'
    ],
    classroomTips: [
      'Dê tempo estendido para o processamento de respostas orais.',
      'Use gestos corporais e demonstração prática sempre que possível.',
      'Celebre cada pequeno progresso para fortalecer a autoeficácia.'
    ]
  }
];

export const NEURO_MAP = new Map<NeuroType, NeurodivergenceMeta>(
  NEURO_TYPES_LIST.map((item) => [item.id, item])
);
