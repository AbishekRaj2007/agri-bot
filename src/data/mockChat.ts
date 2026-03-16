export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  textHi?: string;
  timestamp: string;
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    text: "Namaste! I'm your AgriShield farming expert. Ask me anything about crops, weather, or flood management.",
    textHi: 'नमस्ते! मैं आपका AgriShield कृषि विशेषज्ञ हूं। फसलों, मौसम या बाढ़ प्रबंधन के बारे में कुछ भी पूछें।',
    timestamp: '10:00 AM',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Which rice variety is best for flood-prone areas in West Bengal?',
    textHi: 'पश्चिम बंगाल के बाढ़ प्रवण क्षेत्रों के लिए कौन सी चावल किस्म सबसे अच्छी है?',
    timestamp: '10:01 AM',
  },
  {
    id: '3',
    sender: 'ai',
    text: "Great question! For flood-prone areas in West Bengal, I recommend **Swarna Sub-1 Rice**. It can survive submergence for up to 14 days and yields around 4.5 tons/acre. It's a Kharif season variety with high flood tolerance. Would you like to know more about planting instructions?",
    textHi: 'बढ़िया सवाल! पश्चिम बंगाल के बाढ़ प्रवण क्षेत्रों के लिए, मैं **स्वर्णा सब-1 चावल** की सिफारिश करता हूं। यह 14 दिनों तक जलमग्नता सह सकता है और लगभग 4.5 टन/एकड़ उपज देता है। यह खरीफ सीजन की किस्म है जिसमें उच्च बाढ़ सहनशीलता है। क्या आप बुवाई निर्देशों के बारे में और जानना चाहेंगे?',
    timestamp: '10:01 AM',
  },
  {
    id: '4',
    sender: 'user',
    text: 'Yes, and also tell me about government schemes for flood-affected farmers.',
    textHi: 'हां, और बाढ़ प्रभावित किसानों के लिए सरकारी योजनाओं के बारे में भी बताएं।',
    timestamp: '10:02 AM',
  },
  {
    id: '5',
    sender: 'ai',
    text: "Sure! Here are the key schemes:\n\n1. **PM Fasal Bima Yojana** — Crop insurance covering flood damage. Premium is just 2% for Kharif crops.\n2. **SDRF (State Disaster Response Fund)** — Direct compensation up to ₹6,800/hectare for crop loss.\n3. **NABARD's Emergency Credit** — Low-interest loans for recovery.\n\nI can help you apply for PM Fasal Bima right now. Would you like that?",
    textHi: "ज़रूर! यहां प्रमुख योजनाएं हैं:\n\n1. **PM फसल बीमा योजना** — बाढ़ क्षति कवर करने वाला फसल बीमा। प्रीमियम खरीफ फसलों के लिए सिर्फ 2% है।\n2. **SDRF (राज्य आपदा प्रतिक्रिया कोष)** — फसल हानि के लिए ₹6,800/हेक्टेयर तक सीधा मुआवजा।\n3. **NABARD आपातकालीन ऋण** — पुनर्प्राप्ति के लिए कम ब्याज ऋण।\n\nमैं अभी PM फसल बीमा के लिए आवेदन करने में आपकी मदद कर सकता हूं। क्या आप चाहेंगे?",
    timestamp: '10:03 AM',
  },
];
