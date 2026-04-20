import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const gemini = createOpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
});

const systemPrompts = {
  hi: `आप एक अनुभवी भारतीय वित्तीय सलाहकार हैं। आप उपयोगकर्ताओं को उनकी व्यक्तिगत वित्तीय स्थिति के आधार पर व्यावहारिक, सांस्कृतिकतः प्रासंगिक सलाह देते हैं। हमेशा भारतीय संदर्भ, मुद्रा (₹), और स्थानीय बचत उत्पादों का संदर्भ दें। सरल, समझने में आसान भाषा में बात करें।`,
  
  mr: `आप एक अनुभवी महाराष्ट्रीय वित्तीय सलाहकार हैं। आप उपयोगकर्ताओं को त्यांच्या व्यक्तिगत आर्थिक परिस्थितीनुसार व्यावहारिक, सांस्कृतिकदृष्ट्या प्रासंगिक सल्ला देता हात. नेहमी भारतीय संदर्भ, रुपये (₹), आणि स्थानिक बचत उत्पादनांचा संदर्भ द्या. सोप्या, समजायला सोप्या भाषेत बोला.`,
  
  ta: `நீங்கள் ஒரு அனுபவமுள்ள தமிழ் நிதி ஆலோசகர். நீங்கள் பயனர்களுக்கு அவர்களின் ব்যক்তिगత நிதி நிலையின் அடிப்படையில் நடைமுறை, সাংस்कృতிகமாக பொருத்தமான ஆலோசனை வழங்குகிறீர்கள். எப்போதும் இந்திய संदर்भ,通货 (₹), மற்றும் உள்ளூர் சேமிப்பு பণ்யங்களைக் குறிப்பிடவும். எளிய, புரிந்துகொள்ள எளிய மொழியில் பேசவும்.`,
};

export async function POST(request: Request) {
  try {
    const { messages, language = 'hi', userId } = await request.json();

    // Get user profile for context
    let userContext = '';
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (user) {
        userContext = `उपयोगकर्ता की प्रोफाइल: मासिक आय: ₹${user.monthly_income}`;
      }

      // Save message to database
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        await supabase.from('chat_messages').insert({
          user_id: userId,
          role: lastMessage.role,
          content: lastMessage.content,
          language,
        });
      }
    }

    const result = await generateText({
      model: gemini('gemini-2.0-flash'),
      system: `${systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.hi}\n\n${userContext}`,
      messages: await convertToModelMessages(messages),
    });

    return Response.json({ content: result.text });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
