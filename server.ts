import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API endpoint for AI activity adaptation
app.post("/api/adapt", async (req, res) => {
  try {
    const {
      originalActivity,
      neurodivergenceType,
      targetNeeds,
      subject,
      gradeLevel,
      extraInstructions,
    } = req.body;

    if (!originalActivity || typeof originalActivity !== "string") {
      res.status(400).json({ error: "O texto da atividade original é obrigatório." });
      return;
    }

    const ai = getAI();
    if (!ai) {
      res.status(503).json({
        error: "Serviço de IA não configurado ou offline. O modo offline será utilizado.",
        offlineAvailable: true,
      });
      return;
    }

    const systemPrompt = `Você é um especialista em Educação Especial e Inclusiva, Neuropsicopedagogia e Desenho Universal para a Aprendizagem (DUA).
Sua missão é receber uma atividade pedagógica tradicional e adaptá-la com rigor metodológico, sensibilidade e alta eficácia prática para alunos neurodivergentes.

Tipos de neurodivergência e diretrizes de adaptação:
1. TEA (Autismo):
   - Linguagem clara, direta, sem ambiguidades ou metáforas complexas não explicadas.
   - Rotina estruturada passo a passo (checklist de execução).
   - Apoios visuais concretos e descrições pictográficas claras.
   - Previsibilidade do início, meio e fim da tarefa.
2. TDAH (Déficit de Atenção e Hiperatividade):
   - Decomposição em micro-tarefas rápidas e dinâmicas (gamificação/checkpoints).
   - Destacar palavras-chave em negrito.
   - Enunciados curtos e objetivos.
   - Estimativas de tempo por etapa para manter o foco.
3. Dislexia:
   - Estruturação com frases curtas e diretas.
   - Alternativas visuais ou orais; vocabulário contextualizado.
   - Destaque fonológico ou silábico nas palavras difíceis.
   - Formatação visual limpa, sem blocos densos de texto.
4. Discalculia:
   - Representações visuais concretas de quantidades e operações (blocos, retas numéricas, desenhos de apoio).
   - Problemas matemáticos contextualizados na vida real do aluno.
   - Divisão da resolução de cálculos em etapas coloridas passo a passo.
5. Altas Habilidades / Superdotação:
   - Aprofundamento conceitual, perguntas investigativas e desafios interdisciplinares.
   - Estímulo à criatividade, pensamento crítico e resolução aberta de problemas.
   - Atividades de expansão sem sobrecarregar com repetição mecânica.
6. Síndrome de Down / Deficiência Intelectual:
   - Carga cognitiva reduzida e simplificada, foco no funcional e prático.
   - Alto suporte imagético e associação direta com a realidade do aluno.
   - Menos opções de múltipla escolha com contraste visual evidente.

Responda em JSON rigoroso com a seguinte estrutura.`;

    const userPrompt = `Adapte a seguinte atividade escolar:
Tipo de Neurodivergência alvo: ${neurodivergenceType || "Todas ou Específica"}
Disciplina/Área: ${subject || "Geral"}
Nível escolar: ${gradeLevel || "Ensino Fundamental"}
Instruções extras do professor: ${extraInstructions || "Nenhuma"}
Necessidades específicas: ${targetNeeds || "Padrão da neurodivergência"}

Texto da Atividade Original:
"""
${originalActivity}
"""

Gere uma adaptação completa, pronta para uso em sala de aula, com justificativas pedagógicas transparentes para o professor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adaptedTitle: {
              type: Type.STRING,
              description: "Título atrativo e claro da atividade adaptada",
            },
            neurodivergence: {
              type: Type.STRING,
              description: "Neurodivergência atendida",
            },
            visualInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Passos numerados curtos e claros de execução",
            },
            adaptedContent: {
              type: Type.STRING,
              description: "O conteúdo principal e exercícios adaptados prontos para aplicação",
            },
            interactiveQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  hint: { type: Type.STRING },
                  visualSupportNote: { type: Type.STRING },
                },
                required: ["number", "question"],
              },
              description: "Questões adaptadas com dicas e apoios visuais",
            },
            pedagogicalJustification: {
              type: Type.STRING,
              description: "Explicação para o professor sobre o porquê destas escolhas pedagógicas",
            },
            sensoryTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dicas de ambiente, estímulos sensoriais e mediação em sala de aula",
            },
          },
          required: [
            "adaptedTitle",
            "neurodivergence",
            "visualInstructions",
            "adaptedContent",
            "pedagogicalJustification",
            "sensoryTips",
          ],
        },
      },
    });

    const outputText = response.text?.trim();
    if (!outputText) {
      throw new Error("Resposta vazia da IA.");
    }

    const parsed = JSON.parse(outputText);
    res.json({ success: true, adaptation: parsed, isAiGenerated: true });
  } catch (error: any) {
    console.error("Erro na adaptação via Gemini:", error);
    res.status(500).json({
      error: error?.message || "Falha ao gerar adaptação via inteligência artificial.",
      offlineAvailable: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
