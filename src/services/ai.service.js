const { chatRole } = require("@/configs/constants");
const OpenAI = require("openai");

const openaiClient = new OpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
});

class AIService {
    /* Chat với AI có thể nhớ ngữ cảnh */
    async completions(systemPrompt, messages = [], options = {}) {
        const { model = "anthropic/claude-haiku-4.5", responseFormat } =
            options;

        // Cấu hình Model & Context Lịch sử + Input Prompt của User
        const body = {
            model,
            messages: [
                { role: chatRole.system, content: systemPrompt },
                ...messages,
            ],
        };

        // JSON Format force
        if (responseFormat) body.response_format = responseFormat;

        // Kết quả từ AI Chatbot trả về
        const response = await openaiClient.chat.completions.create(body);
        return response.choices[0].message.content;
    }
}

module.exports = new AIService();
