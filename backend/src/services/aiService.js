const { GoogleGenAI } = require('@google/genai');

class AIService {
  static async analyzeWebsite(websiteName, planFeatures, htmlSnippet) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
      const prompt = `You are a web hosting expert. Analyze the following details of a user's website and provide a brief, actionable report on how they can improve performance, security, and user experience.

Website Name: ${websiteName}
Hosting Plan Features: ${planFeatures.join(', ')}
HTML Snippet:
${htmlSnippet}

Please provide 3-5 concrete suggestions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Error generating AI report:', error.message);
      throw new Error('Failed to generate AI report');
    }
  }

  static async analyzeFeedbackAndCode(websiteName, feedbacks, htmlSnippet) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
      
      const feedbackText = feedbacks.length > 0 
        ? feedbacks.map(f => `- Rating: ${f.rating}/5, Comment: "${f.comment}"`).join('\n')
        : 'No user feedback received yet.';

      const prompt = `You are a Senior Web Development Consultant and AI UX/UI Expert. Analyze the following details of a user's website, paying special attention to the provided source code and the actual user feedback.

Website Name: ${websiteName}

--- User Feedback ---
${feedbackText}

--- Source Code (HTML) ---
${htmlSnippet}

Based on the feedback and the code, please provide an actionable and highly technical report. Format your response in clean Markdown. Include:
1. **Key Insights**: What are the main issues users are facing?
2. **Code Recommendations**: What exact changes in the source code can address these issues or improve performance/UX?
3. **Growth Techniques**: Strategies to improve user retention based on the current implementation.

Provide concrete, actionable techniques rather than generic advice.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Error generating AI insights:', error.message);
      throw new Error('Failed to generate AI insights from feedback and code.');
    }
  }
}

module.exports = AIService;
