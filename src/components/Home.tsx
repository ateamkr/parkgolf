import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Clock, 
  TrendingUp, 
  Building2, 
  Users, 
  Award, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin,
  ChevronRight,
  Menu,
  X,
  Store,
  GraduationCap,
  ShoppingBag,
  CreditCard,
  Layout
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

// --- Components ---

const Counter = ({ value, duration = 2000 }: { value: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);

  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9,]/g, '');
  const hasComma = value.includes(',');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let currentCount = 0;
    const end = numericValue;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentCount));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numericValue, duration]);

  return (
    <span ref={countRef}>
      {hasComma ? count.toLocaleString() : count}
      {suffix}
    </span>
  );
};

const Navbar = ({ brandName }: { brandName: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: '브랜드 소개', href: '#brand' },
    { name: '창업 경쟁력', href: '#features' },
    { name: '수익 구조', href: '#revenue' },
    { name: '제품 안내', href: '#products' },
    { name: '창업 절차', href: '#process' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            <span className="text-2xl font-bold text-green-800 tracking-tight">{brandName}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-gray-600 hover:text-green-600 font-medium transition-colors">{link.name}</a>
            ))}
            <button className="bg-green-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">창업 문의하기</button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
          </div>
        </div>
      </div>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white border-b border-gray-100 px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-green-600">{link.name}</a>
          ))}
          <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold w-full">창업 문의하기</button>
        </motion.div>
      )}
    </nav>
  );
};

const SectionHeading = ({ title, subtitle, light = false }: { title: string; subtitle?: string; light?: boolean }) => (
  <div className="text-center mb-16">
    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={cn("text-3xl md:text-4xl font-bold mb-4", light ? "text-white" : "text-gray-900")}>{title}</motion.h2>
    {subtitle && <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className={cn("text-lg max-w-2xl mx-auto", light ? "text-green-50" : "text-gray-600")}>{subtitle}</motion.p>}
    <div className="w-20 h-1.5 bg-green-500 mx-auto mt-6 rounded-full" />
  </div>
);

const iconMap: Record<string, any> = { Clock, TrendingUp, Building2, Award, Users, Store, Trophy, ShoppingBag, GraduationCap, CreditCard };

export default function Home() {
  const [heroSlides, setHeroSlides] = useState<any[]>([
    {
      url: "https://images.unsplash.com/photo-1591491640784-3232eb748d4b?auto=format&fit=crop&q=80&w=1920",
      title: "시니어 건강을 지키는",
      highlight: "행복한 공간",
      subtitle: "사람이 모이고 이야기가 피어나는 우리 동네 사랑방\n건강과 수익을 동시에 챙기는 스마트 솔루션",
      order: 0
    },
    {
      url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1920",
      title: "3일이면 완성되는",
      highlight: "스크린 파크골프",
      subtitle: "조립식 부스 시스템으로 빠르고 간편한 설치\n지금 바로 성공 창업의 기회를 잡으세요",
      order: 1
    },
    {
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920",
      title: "취미가 수익이 되는",
      highlight: "파크사랑방",
      subtitle: "저비용 소형 스크린 파크골프 기반\n용품 + 교육 + 운영을 결합한 혁신적인 수익형 매장",
      order: 2
    }
  ]);
  const [stats, setStats] = useState<any[]>([
    { label: '설치 기간', value: '3일', order: 0 },
    { label: '수익 모델', value: '4가지', order: 1 },
    { label: '전국 지점', value: '200+', order: 2 },
    { label: '월 예상 수익', value: '1,000만+', order: 3 },
  ]);
  const [features, setFeatures] = useState<any[]>([
    { icon: 'Clock', title: '3일 완성 시스템', desc: '설계부터 시공까지 단 3일이면 오픈 가능합니다.', order: 0 },
    { icon: 'TrendingUp', title: '복합 수익 구조', desc: '이용료, 용품, 교육, 회원제 4가지 수익 모델.', order: 1 },
    { icon: 'Building2', title: '저비용 창업', desc: '조립식 부스와 최적화된 인테리어로 비용 최소화.', order: 2 },
    { icon: 'Award', title: '최고의 품질', desc: '검증된 스크린 장비와 프리미엄 파크골프 용품.', order: 3 },
    { icon: 'Users', title: '전문 아카데미', desc: '본사 교육 노하우 전수로 초보자도 운영 가능.', order: 4 },
    { icon: 'Store', title: '무인 운영 가능', desc: '스마트 시스템 도입으로 효율적인 매장 관리.', order: 5 },
  ]);
  const [revenueModels, setRevenueModels] = useState<any[]>([
    { icon: 'Store', title: '타석 이용료', desc: '시간당 이용 요금으로 발생하는 안정적인 매출', price: '월 400~600만', order: 0 },
    { icon: 'ShoppingBag', title: '용품 판매', desc: '고마진 파크골프채, 공, 액세서리 판매 수익', price: '월 200~400만', order: 1 },
    { icon: 'GraduationCap', title: '아카데미 교육', desc: '레슨 및 지도자 자격증 과정 수강료 수익', price: '월 150~300만', order: 2 },
    { icon: 'CreditCard', title: '회원제 운영', desc: '월/연 단위 회원권 판매로 고정 수익 확보', price: '월 200~500만', order: 3 },
  ]);
  const [products, setProducts] = useState<any[]>([
    { 
      title: '스크린창업 솔루션', 
      subtitle: '조립부스·인테리어·장비까지 원스톱', 
      imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800',
      features: ['맞춤형 부스 시공', '인테리어 디자인', '스크린골프 장비 설치'],
      order: 0,
      layout: 'grid'
    },
    { 
      title: '골프채·용품 유통', 
      subtitle: '다양한 브랜드, 최고의 가격', 
      imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=80&w=800',
      features: ['정품 골프채', '골프용품·액세서리', '창업자 특별 할인'],
      order: 1,
      layout: 'grid'
    },
    { 
      title: '파크아카데미', 
      subtitle: '성공 창업을 위한 모든 것', 
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      features: ['창업 교육', '운영 노하우', '지속적인 컨설팅'],
      order: 2,
      layout: 'grid'
    },
    { 
      title: '이동식컨테이너 사업', 
      subtitle: '이동과 설치가 쉬운 맞춤형 컨테이너', 
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
      features: ['스크린골프장', '매장·사무실', '빠른 설치·이동'],
      order: 3,
      layout: 'full'
    }
  ]);
  const [settings, setSettings] = useState<any>({
    brandName: '파크사랑방',
    contactPhone: '1661-6842',
    contactEmail: 'info@parksarang.co.kr',
    address: '서울특별시 강남구 테헤란로 123, 4층 (파크빌딩)',
    footerDescription: '파크사랑방은 시니어 건강과 즐거움을 위한 최고의 파크골프 환경을 제공합니다. 차별화된 기술력과 서비스로 파크골프의 새로운 기준을 제시합니다.',
    brandIntro: {
      title: "단순한 매장이 아닌\n지속 가능한 수익 플랫폼입니다.",
      description: "파크사랑방은 시니어 인구 급증과 실내 스포츠 수요 폭발에 맞춰 설계된 프리미엄 파크골프 프렌차이즈입니다. 조립식 부스 시스템으로 단 3일이면 창업이 가능하며, 4가지 복합 수익 구조로 안정적인 매출을 보장합니다.",
      points: [
        '소형 평수(15~30평) 최적화 창업',
        '무인 운영 시스템으로 인건비 절감',
        '본사 원스톱 지원',
        '정부 지원 사업 연계 가능'
      ],
      badgeValue: "100%",
      badgeLabel: "점주 만족도",
      imageUrl: "https://images.unsplash.com/photo-1591491640784-3232eb748d4b?auto=format&fit=crop&q=80&w=1920"
    }
  });
  const [currentHero, setCurrentHero] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroSnap, statsSnap, featuresSnap, revSnap, productsSnap, settingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'hero_slides'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'stats'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'features'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'revenue_models'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'products'), orderBy('order', 'asc'))),
          getDoc(doc(db, 'settings', 'site'))
        ]);

        if (heroSnap.docs.length > 0) setHeroSlides(heroSnap.docs.map(d => d.data()));
        if (statsSnap.docs.length > 0) setStats(statsSnap.docs.map(d => d.data()));
        if (featuresSnap.docs.length > 0) setFeatures(featuresSnap.docs.map(d => d.data()));
        if (revSnap.docs.length > 0) setRevenueModels(revSnap.docs.map(d => d.data()));
        if (productsSnap.docs.length > 0) setProducts(productsSnap.docs.map(d => d.data()));
        if (settingsSnap.exists()) setSettings(settingsSnap.data());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (heroSlides.length > 0) {
      const timer = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroSlides]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;


  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-900">
      <Navbar brandName={settings.brandName} />

      {/* Hero Section */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden bg-green-950">
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <motion.div key={currentHero} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute inset-0">
              <img src={heroSlides[currentHero].url} alt="Hero Background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/50" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          <motion.div key={`badge-${currentHero}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 rounded-full bg-green-500 text-white text-xs md:text-sm font-bold tracking-wider uppercase shadow-lg">3일 완성 스크린 파크골프 창업</motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={`content-${currentHero}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 md:mb-8 leading-[1.2] md:leading-[1.1] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {heroSlides[currentHero].title}<br />
                <span className="text-green-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{heroSlides[currentHero].highlight}</span> 창업 솔루션
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white font-medium mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed whitespace-pre-line drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] px-4">
                {heroSlides[currentHero].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <button className="w-full sm:w-auto bg-green-600 text-white px-6 py-3.5 md:px-10 md:py-5 rounded-xl md:rounded-2xl text-base md:text-xl font-bold hover:bg-green-700 transition-all shadow-2xl shadow-green-900/40 flex items-center justify-center gap-2 group">무료 창업 상담 받기 <ChevronRight className="group-hover:translate-x-1 transition-transform" /></button>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-6 py-3.5 md:px-10 md:py-5 rounded-xl md:rounded-2xl text-base md:text-xl font-bold hover:bg-white hover:text-green-800 transition-all">브랜드 소개서 다운로드</button>
          </motion.div>
          <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentHero(idx)} className={cn("w-3 h-3 rounded-full transition-all duration-300", currentHero === idx ? "bg-green-500 w-10" : "bg-white/50 hover:bg-white")} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="text-center group">
                <p className="text-gray-400 text-base font-semibold mb-2 uppercase tracking-widest group-hover:text-green-500 transition-colors">{stat.label}</p>
                <p className="text-3xl md:text-5xl font-black text-green-600 tracking-tight"><Counter value={stat.value} /></p>
                <div className="w-8 h-1 bg-green-100 mx-auto mt-4 rounded-full group-hover:w-16 group-hover:bg-green-500 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Intro */}
      <section id="brand" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, staggerChildren: 0.2 } } }}>
              <motion.h3 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-green-600 font-bold text-xl mb-4">왜 {settings.brandName}인가?</motion.h3>
              <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight whitespace-pre-line">
                {settings.brandIntro?.title?.includes('수익 플랫폼') ? (
                  <>
                    {settings.brandIntro.title.split('수익 플랫폼')[0]}
                    <span className="text-green-600">수익 플랫폼</span>
                    {settings.brandIntro.title.split('수익 플랫폼')[1]}
                  </>
                ) : settings.brandIntro?.title}
              </motion.h2>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-xl text-gray-600 mb-10 leading-relaxed">
                {settings.brandIntro?.description}
              </motion.p>
              <motion.ul variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="space-y-5">
                {settings.brandIntro?.points?.map((item: string) => (
                  <motion.li key={item} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-4 text-gray-800 font-semibold text-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="text-green-600" size={20} /></div>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <img src={settings.brandIntro?.imageUrl || heroSlides[0].url} alt="Brand Intro" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hidden md:block">
                <p className="text-4xl font-black text-green-600 mb-1">{settings.brandIntro?.badgeValue}</p>
                <p className="text-gray-500 font-bold">{settings.brandIntro?.badgeLabel}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title={`${settings.brandName}만의 핵심 강점`} subtitle="비교할 수 없는 경쟁력으로 성공 창업의 길을 열어드립니다." />
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = iconMap[feature.icon] || Layout;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all group">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors"><Icon size={28} /></div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section id="revenue" className="py-24 bg-green-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1920" alt="Park golf background" className="w-full h-full object-cover opacity-20 blur-sm scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-950/40 to-green-950/80" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading title="하나의 매장에서 4가지 수익!" subtitle="지속적으로 수익이 창출되는 안정적인 비즈니스 모델입니다." light />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {revenueModels.map((model, idx) => {
              const Icon = iconMap[model.icon] || Store;
              return (
                <motion.div key={model.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/10 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"><Icon size={32} /></div>
                  <h4 className="text-2xl font-bold mb-4">{model.title}</h4>
                  <p className="text-green-100/80 mb-6 text-sm leading-relaxed">{model.desc}</p>
                  <div className="pt-6 border-t border-white/10"><p className="text-green-400 font-bold text-lg">{model.price}</p></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="사업 분야" subtitle={`${settings.brandName}의 차별화된 비즈니스 솔루션을 소개합니다.`} />
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {products.filter(p => p.layout === 'grid').map((product, idx) => (
              <motion.div key={product.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="aspect-[16/10] overflow-hidden"><img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                <div className="p-8 flex-1 flex flex-col">
                  <h4 className="text-2xl font-bold mb-1">{product.title}</h4>
                  <p className="text-gray-500 text-sm mb-6">{product.subtitle}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {product.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-gray-700 font-medium"><CheckCircle2 className="text-green-500 shrink-0" size={18} />{f}</li>
                    ))}
                  </ul>
                  <button className="w-fit bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2">자세히 보기 <ChevronRight size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>
          {products.filter(p => p.layout === 'full').map((product) => (
            <motion.div key={product.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
              <div className="md:w-[35%] aspect-[16/10] md:aspect-auto overflow-hidden"><img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                <h4 className="text-2xl font-bold mb-1">{product.title}</h4>
                <p className="text-gray-500 text-sm mb-6">{product.subtitle}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {product.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-gray-700 font-medium"><CheckCircle2 className="text-green-500 shrink-0" size={18} />{f}</li>
                  ))}
                </ul>
                <button className="w-fit bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2">자세히 보기 <ChevronRight size={18} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section id="process" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-green-600 p-12 text-white">
                <h3 className="text-3xl font-bold mb-6">성공 창업의 시작,<br />지금 바로 상담하세요!</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Phone size={20} /></div>
                    <div><p className="text-xs text-green-200 uppercase font-bold tracking-wider">대표 번호</p><p className="text-xl font-bold">{settings.contactPhone}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Mail size={20} /></div>
                    <div><p className="text-xs text-green-200 uppercase font-bold tracking-wider">이메일</p><p className="text-lg font-bold">{settings.contactEmail}</p></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 p-12">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">성함</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="홍길동" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-2">연락처</label><input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="010-0000-0000" /></div>
                  </div>
                  <button className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-all">상담 신청하기</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"><div className="w-4 h-4 border border-white rounded-full" /></div>
                <span className="text-2xl font-bold text-white tracking-tight">{settings.brandName}</span>
              </div>
              <p className="max-w-sm mb-6 leading-relaxed">{settings.footerDescription}</p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Info</h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><MapPin size={18} className="shrink-0 mt-1" /><span>{settings.address}</span></li>
                <li className="flex items-center gap-3"><Phone size={18} /><span>{settings.contactPhone}</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm flex flex-col sm:flex-row justify-center items-center gap-6">
            <p>© 2024 {settings.brandName}. All rights reserved.</p>
            <Link 
              to="/admin" 
              className="px-4 py-1.5 rounded-full border border-gray-800 hover:border-gray-600 hover:text-white transition-all text-xs font-medium"
            >
              관리자 로그인
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
