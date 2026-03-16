export type SchemeCategory = 'Income Support' | 'Insurance' | 'Credit' | 'Irrigation' | 'Subsidy' | 'Infrastructure';

export interface Scheme {
  id: string;
  name: string;
  nameHi: string;
  ministry: string;
  category: SchemeCategory;
  tagline: string;
  taglineHi: string;
  benefit: string;
  benefitHi: string;
  eligibility: string[];
  eligibilityHi: string[];
  documents: string[];
  howToApply: string;
  deadline: string | null;
  helpline: string;
  applyUrl: string;
}

export const mockSchemes: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    ministry: 'Ministry of Agriculture',
    category: 'Income Support',
    tagline: 'Direct income support of ₹6,000/year to farmer families.',
    taglineHi: 'किसान परिवारों को ₹6,000/वर्ष की प्रत्यक्ष आय सहायता।',
    benefit: '₹2,000 every 4 months (3 installments/year) directly into bank account.',
    benefitHi: '₹2,000 हर 4 महीने (3 किश्तें/वर्ष) सीधे बैंक खाते में।',
    eligibility: [
      'Small and marginal farmers owning up to 2 hectares of land',
      'Land must be in cultivator\'s name',
      'Must have valid Aadhaar card',
      'Must not be a current or ex government employee or income taxpayer',
    ],
    eligibilityHi: [
      'छोटे और सीमांत किसान जिनके पास 2 हेक्टेयर तक भूमि है',
      'भूमि किसान के नाम होनी चाहिए',
      'वैध आधार कार्ड अनिवार्य',
      'वर्तमान/पूर्व सरकारी कर्मचारी और आयकरदाता पात्र नहीं',
    ],
    documents: ['Aadhaar Card', 'Bank passbook (IFSC)', 'Land ownership records (Khatauni)', 'Passport size photo'],
    howToApply: 'Apply via PM-KISAN portal or visit nearest Common Service Centre (CSC).',
    deadline: 'Rolling — apply anytime',
    helpline: '155261 / 011-24300606',
    applyUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: 'PMFBY',
    nameHi: 'प्रधानमंत्री फसल बीमा योजना',
    ministry: 'Ministry of Agriculture',
    category: 'Insurance',
    tagline: 'Crop insurance at the lowest premium — covers loss due to natural disasters.',
    taglineHi: 'सबसे कम प्रीमियम पर फसल बीमा — प्राकृतिक आपदाओं से नुकसान की भरपाई।',
    benefit: 'Premium: 2% for Kharif, 1.5% for Rabi crops. Full sum insured for total crop loss.',
    benefitHi: 'प्रीमियम: खरीफ 2%, रबी 1.5%। पूर्ण फसल नुकसान पर पूरी बीमित राशि।',
    eligibility: [
      'All farmers growing notified crops in notified areas',
      'Both loanee and non-loanee farmers eligible',
      'Sharecroppers and tenant farmers also eligible',
    ],
    eligibilityHi: [
      'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान',
      'ऋणी और गैर-ऋणी दोनों किसान पात्र',
      'बटाईदार और काश्तकार किसान भी पात्र',
    ],
    documents: ['Aadhaar Card', 'Bank account details', 'Land records / lease agreement', 'Sowing certificate'],
    howToApply: 'Enroll through bank, insurance company office, or PMFBY portal within cut-off date.',
    deadline: 'Before sowing cut-off dates (varies by state & crop)',
    helpline: '14447',
    applyUrl: 'https://pmfby.gov.in',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    nameHi: 'किसान क्रेडिट कार्ड',
    ministry: 'Ministry of Finance',
    category: 'Credit',
    tagline: 'Flexible credit for crop production needs at just 4% interest p.a.',
    taglineHi: 'केवल 4% वार्षिक ब्याज पर फसल उत्पादन के लिए लचीला ऋण।',
    benefit: 'Credit limit based on land holding; interest rate subsidized to 4% per annum.',
    benefitHi: 'भूमि के आधार पर क्रेडिट सीमा; ब्याज दर 4% वार्षिक सब्सिडाइज़्ड।',
    eligibility: [
      'All farmers — individual, joint borrowers, SHG or JLG',
      'Tenant farmers, oral lessees, share croppers eligible',
      'No minimum land requirement',
    ],
    eligibilityHi: [
      'सभी किसान — व्यक्तिगत, संयुक्त उधारकर्ता, SHG या JLG',
      'किरायेदार किसान, मौखिक पट्टेदार, बटाईदार पात्र',
      'कोई न्यूनतम भूमि आवश्यकता नहीं',
    ],
    documents: ['Aadhaar', 'PAN Card', 'Passport photo', 'Land ownership / lease documents', 'Address proof'],
    howToApply: 'Apply at any nationalized bank, cooperative bank, or regional rural bank branch.',
    deadline: 'Rolling — no deadline',
    helpline: '1800-180-1551',
    applyUrl: 'https://agricoop.nic.in/en/kcc',
  },
  {
    id: 'pmksy',
    name: 'PMKSY',
    nameHi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    ministry: 'Ministry of Jal Shakti',
    category: 'Irrigation',
    tagline: '"Har Khet ko Pani" — subsidy on drip & sprinkler irrigation systems.',
    taglineHi: '"हर खेत को पानी" — ड्रिप और स्प्रिंकलर सिंचाई पर 55–90% सब्सिडी।',
    benefit: '55% subsidy for general farmers, 90% for SC/ST and small/marginal farmers on micro-irrigation.',
    benefitHi: 'सामान्य किसानों को 55%, SC/ST व लघु/सीमांत किसानों को 90% सब्सिडी।',
    eligibility: [
      'Farmers with direct land holding',
      'Tenant farmers with at least 7 years of lease',
      'Members of producer groups or cooperatives',
    ],
    eligibilityHi: [
      'सीधे भूमि धारण करने वाले किसान',
      'कम से कम 7 वर्ष के पट्टे वाले काश्तकार',
      'उत्पादक समूहों या सहकारी संस्थाओं के सदस्य',
    ],
    documents: ['Aadhaar', 'Land records', 'Bank details', 'Irrigation plan / quotation from vendor'],
    howToApply: 'Apply through State Horticulture / Agriculture Department or PMKSY portal.',
    deadline: 'State-wise — check state portal',
    helpline: '1800-180-1551',
    applyUrl: 'https://pmksy.gov.in',
  },
  {
    id: 'rkvy',
    name: 'RKVY-RAFTAAR',
    nameHi: 'राष्ट्रीय कृषि विकास योजना',
    ministry: 'Ministry of Agriculture',
    category: 'Infrastructure',
    tagline: 'Grants for agri infrastructure, processing units, and agri-startups.',
    taglineHi: 'कृषि बुनियादी ढांचे, प्रसंस्करण इकाइयों और कृषि-स्टार्टअप के लिए अनुदान।',
    benefit: 'Up to ₹25 lakh seed funding for agri-startups; infrastructure grants for FPOs.',
    benefitHi: 'कृषि-स्टार्टअप के लिए ₹25 लाख तक बीज अनुदान; FPO के लिए बुनियादी ढांचा अनुदान।',
    eligibility: [
      'Agri-startups (companies up to 5 years old)',
      'Farmer Producer Organisations (FPOs)',
      'State Government bodies for infrastructure',
    ],
    eligibilityHi: [
      'कृषि-स्टार्टअप (5 वर्ष तक की कंपनियां)',
      'किसान उत्पादक संगठन (FPO)',
      'बुनियादी ढांचे के लिए राज्य सरकार की संस्थाएं',
    ],
    documents: ['Business plan', 'Registration certificate', 'Bank details', 'Aadhaar / PAN of promoters'],
    howToApply: 'Apply via RKVY RAFTAAR portal or through State Agriculture Department.',
    deadline: 'Annual rounds — check portal',
    helpline: '011-23382454',
    applyUrl: 'https://rkvy.nic.in',
  },
  {
    id: 'nfsm',
    name: 'NFSM',
    nameHi: 'राष्ट्रीय खाद्य सुरक्षा मिशन',
    ministry: 'Ministry of Agriculture',
    category: 'Subsidy',
    tagline: 'Subsidy on certified seeds, micro-nutrients, and farm mechanisation.',
    taglineHi: 'प्रमाणित बीज, सूक्ष्म पोषक तत्व और कृषि यंत्रीकरण पर सब्सिडी।',
    benefit: '50% subsidy on certified seeds and micro-nutrient inputs; subsidy on farm machinery.',
    benefitHi: 'प्रमाणित बीज और सूक्ष्म पोषक तत्वों पर 50% सब्सिडी; कृषि मशीनरी पर सब्सिडी।',
    eligibility: [
      'Farmers in notified districts for rice, wheat, pulses, coarse cereals',
      'Priority to small and marginal farmers',
    ],
    eligibilityHi: [
      'धान, गेहूं, दलहन, मोटे अनाज के लिए अधिसूचित जिलों के किसान',
      'छोटे और सीमांत किसानों को प्राथमिकता',
    ],
    documents: ['Aadhaar', 'Land records', 'Bank details'],
    howToApply: 'Apply through local Agriculture Department office or Krishi Vigyan Kendra.',
    deadline: 'Seasonal — varies by state',
    helpline: '011-23382629',
    applyUrl: 'https://nfsm.gov.in',
  },
];
