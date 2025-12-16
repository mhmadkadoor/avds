import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Feature {
  id: string;
  emoji: string;
  titleEn: string;
  titleTr: string;
  titleAr: string;
  descriptionEn: string;
  descriptionTr: string;
  descriptionAr: string;
}

interface FeaturesContextType {
  features: Feature[];
  updateFeatures: (features: Feature[]) => void;
  resetFeatures: () => void;
}

const defaultFeatures: Feature[] = [
  {
    id: '1',
    emoji: '🔍',
    titleEn: 'Smart Search',
    titleTr: 'Akıllı Arama',
    titleAr: 'بحث ذكي',
    descriptionEn: 'Find exactly what you\'re looking for with our advanced search filters',
    descriptionTr: 'Gelişmiş arama filtrelerimizle tam olarak aradığınızı bulun',
    descriptionAr: 'اعثر على ما تبحث عنه بالضبط باستخدام فلاتر البحث المتقدمة لدينا'
  },
  {
    id: '2',
    emoji: '🤖',
    titleEn: 'AI Assistant',
    titleTr: 'Yapay Zeka Asistanı',
    titleAr: 'مساعد الذكاء الاصطناعي',
    descriptionEn: 'Get personalized recommendations and answers to all your questions',
    descriptionTr: 'Kişiselleştirilmiş öneriler ve tüm sorularınıza cevaplar alın',
    descriptionAr: 'احصل على توصيات مخصصة وإجابات لجميع أسئلتك'
  },
  {
    id: '3',
    emoji: '⭐',
    titleEn: 'Save Favorites',
    titleTr: 'Favorileri Kaydet',
    titleAr: 'حفظ المفضلة',
    descriptionEn: 'Keep track of vehicles you love and compare them easily',
    descriptionTr: 'Beğendiğiniz araçları takip edin ve kolayca karşılaştırın',
    descriptionAr: 'تتبع المركبات التي تحبها وقارن بينها بسهولة'
  }
];

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);

  // DEBUG: Log that we are using defaults
  useEffect(() => {
    console.log('Features initialized with defaults:', defaultFeatures);
  }, []);

  useEffect(() => {
    localStorage.setItem('homepage-features', JSON.stringify(features));
  }, [features]);

  const updateFeatures = (newFeatures: Feature[]) => {
    setFeatures(newFeatures);
  };

  const resetFeatures = () => {
    setFeatures(defaultFeatures);
  };

  return (
    <FeaturesContext.Provider value={{ features, updateFeatures, resetFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeaturesContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeaturesProvider');
  }
  return context;
}
