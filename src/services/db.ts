import { AdaptedActivity } from '../types';

const DB_NAME = 'neuro_adapt_db';
const DB_VERSION = 1;
const STORE_NAME = 'adapted_activities';

class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
          reject(new Error('IndexedDB não suportado neste navegador.'));
          return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('neurodivergence', 'neurodivergence', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('title', 'title', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
      });
    }
    return this.dbPromise;
  }

  public async saveActivity(activity: AdaptedActivity): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(activity);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllActivities(): Promise<AdaptedActivity[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Most recent first
      const results: AdaptedActivity[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  public async getActivityById(id: string): Promise<AdaptedActivity | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteActivity(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async exportBackup(): Promise<string> {
    const all = await this.getAllActivities();
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        totalActivities: all.length,
        activities: all,
      },
      null,
      2
    );
  }

  public async importBackup(jsonString: string): Promise<number> {
    try {
      const parsed = JSON.parse(jsonString);
      const activities: AdaptedActivity[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.activities)
        ? parsed.activities
        : [];

      if (activities.length === 0) {
        throw new Error('Nenhuma atividade encontrada no arquivo de backup.');
      }

      let count = 0;
      for (const act of activities) {
        if (act.id && act.title && act.neurodivergence) {
          await this.saveActivity(act);
          count++;
        }
      }
      return count;
    } catch (e: any) {
      throw new Error(`Erro ao importar dados: ${e.message}`);
    }
  }

  /**
   * Populate initial demo activities if store is fresh
   */
  public async seedInitialExamples(): Promise<void> {
    const existing = await this.getAllActivities();
    if (existing.length > 0) return;

    const initialData: AdaptedActivity[] = [
      {
        id: 'seed-tea-eletricidade',
        title: 'História: Como as Lâmpadas Mudaram as Cidades',
        originalText: 'Texto sobre a introdução da eletricidade nas cidades no século XX.',
        neurodivergence: 'tea',
        subject: 'História',
        gradeLevel: '5º Ano',
        studentAlias: 'Arthur - 5º Ano B',
        createdAt: Date.now() - 3600000 * 24,
        updatedAt: Date.now() - 3600000 * 24,
        isAiGenerated: false,
        tags: ['Iluminação', 'História', 'Checklist'],
        visualInstructions: [
          'Passo 1: Leia a história da lâmpada abaixo (3 minutos).',
          'Passo 2: Olhe a figura do acendedor de lampiões.',
          'Passo 3: Marque com um lápis as 2 coisas que mudaram.',
          'Passo 4: Guarde o material quando terminar.'
        ],
        adaptedContent: `### Linha do Tempo Visual das Ruas:
1. **Passado (Antes da Eletricidade):**
   - As ruas usavam **lampiões de óleo ou gás**.
   - Uma pessoa chamada **Acendedor de Lampiões** andava com uma vara acendendo um por um ao escurecer.
   - À noite, as ruas eram escuras e silenciosas.

2. **Presente (Depois da Eletricidade):**
   - Chegaram os **postes com lâmpadas elétricas**.
   - As fábricas puderam funcionar com luz clara.
   - As pessoas puderam passear com mais claridade e segurança.`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Quem acendia as luzes da rua antes da eletricidade?',
            options: ['O Acendedor de Lampiões', 'O motorista do ônibus', 'O guarda de trânsito'],
            hint: 'Era a profissão de quem carregava uma vara comprida com fogo.',
            visualSupportNote: 'Dica Visual: Pense em alguém que andava a pé acendendo cada poste.'
          },
          {
            number: 2,
            question: 'Qual dessas frases é verdadeira sobre a energia elétrica?',
            options: [
              'As ruas ficaram mais iluminadas e seguras à noite.',
              'As pessoas pararam de usar qualquer tipo de luz.',
              'As cidades fecharam todas as fábricas.'
            ],
            hint: 'A eletricidade facilitou ver tudo no escuro.',
          }
        ],
        pedagogicalJustification: 'Para o aluno com TEA, a atividade substituiu metáforas por uma linha do tempo binária (Passado vs Presente) com rotina de 4 passos finitos e perguntas diretas de múltipla escolha com distratores óbvios.',
        sensoryTips: [
          'Ambiente de trabalho organizado sem materiais extras na carteira.',
          'Uso de fone abafador se a sala estiver com ruído de ventilador ou conversas paralelas.',
          'Confirmação visual do checklist conforme cada passo é concluído.'
        ]
      },
      {
        id: 'seed-tdah-ciclo-agua',
        title: 'Missão Ciência: As 4 Fases da Água Voadora!',
        originalText: 'O Ciclo da Água na Natureza e suas transformações.',
        neurodivergence: 'tdah',
        subject: 'Ciências',
        gradeLevel: '4º Ano',
        studentAlias: 'Gabriel - 4º Ano A',
        createdAt: Date.now() - 3600000 * 12,
        updatedAt: Date.now() - 3600000 * 12,
        isAiGenerated: false,
        tags: ['Água', 'Gamificação', 'Micro-tarefas'],
        visualInstructions: [
          '⚡ Desafio 1: Leia a palavra em negrito (1 min).',
          '⚡ Desafio 2: Descubra o superpoder do Sol (2 min).',
          '⚡ Desafio 3: Marque seu checklist de vitória!'
        ],
        adaptedContent: `### O Jogo da Gota d'Água 💧
- **Fase 1: O Calor Subiu! (EVAPORAÇÃO)**
  - O Sol esquenta o rio ➡️ A água vira vapor invisível e sobe como um foguete!
- **Fase 2: O Frio Abraçou! (CONDENSAÇÃO)**
  - Lá em cima está gelado ➡️ Os vapores se juntam e formam as **nuvens fofas**.
- **Fase 3: Pesou, Caiu! (PRECIPITAÇÃO)**
  - A nuvem ficou cheia demais ➡️ Cai a **CHUVA** molhando a terra!
- **Fase 4: A Grande Volta! (INFILTRAÇÃO)**
  - A água entra na terra e corre de volta para o rio. O ciclo começa de novo!`,
        interactiveQuestions: [
          {
            number: 1,
            question: 'Quem dá a energia de calor para a água evaporar?',
            options: ['☀️ O Sol', '🌙 A Lua', '💨 O Vento frio'],
            hint: 'É aquela estrela brilhante e muito quente!',
          },
          {
            number: 2,
            question: 'Quando a nuvem fica super pesada de água, o que acontece?',
            options: ['🌧️ Chove (Precipitação)', '🧊 Vira areia', '☀️ O Sol apaga'],
            hint: 'Você precisa abrir o guarda-chuva!',
          }
        ],
        pedagogicalJustification: 'Adaptação estruturada em formato de fases de videogame com emojis, quebras dinâmicas de linha, negritos direcionais e micro-recompensas, sustentando a atenção executiva do aluno com TDAH.',
        sensoryTips: [
          'Permita alternância postural (ex: responder em pé ou com prancheta móvel).',
          'Utilize um timer visual com som suave ao fim de cada fase.',
          'Pausas de 1 minuto para esticar os braços entre exercícios.'
        ]
      }
    ];

    for (const item of initialData) {
      await this.saveActivity(item);
    }
  }
}

export const localDB = new LocalDatabase();
