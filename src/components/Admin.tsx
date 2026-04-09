import { useState, useEffect } from 'react';
import { db, auth, signInWithGoogle, logout } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Plus, 
  Trash2, 
  Save, 
  LogOut, 
  LogIn, 
  Image as ImageIcon, 
  Type, 
  Hash, 
  Layout,
  ChevronRight,
  ChevronDown,
  Settings
} from 'lucide-react';

const ADMIN_EMAIL = "ateamshero@gmail.com";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login error detail:", error);
      // 구체적인 에러 메시지 처리
      if (error.code === 'auth/popup-blocked') {
        setLoginError("팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError("현재 도메인이 Firebase 승인 도메인에 등록되지 않았습니다.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError("로그인 창이 닫혔습니다. 다시 시도해주세요.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore this error as it's usually a duplicate request
      } else {
        setLoginError(error.message || "로그인 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">관리자 로그인</h1>
          <p className="text-gray-600 mb-8">홈페이지 콘텐츠 관리를 위해 관리자 계정으로 로그인해주세요.</p>
          
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {loginError}
              {loginError.includes("닫혔습니다") && (
                <p className="mt-2 text-xs text-red-500 font-normal">
                  * 미리보기 창에서는 팝업이 차단될 수 있습니다. <br/>
                  우측 상단의 <b>'새 탭에서 열기'</b> 버튼을 눌러 시도해 보세요.
                </p>
              )}
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all mb-3"
          >
            <LogIn size={20} />
            Google로 로그인
          </button>

          <button 
            onClick={() => window.open(window.location.href, '_blank')}
            className="w-full bg-white text-gray-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Layout size={20} />
            새 탭에서 관리자 페이지 열기
          </button>

          <p className="mt-6 text-xs text-gray-400">
            * 로그인 팝업이 즉시 닫힌다면 '새 탭에서 열기'를 이용해주세요.
          </p>
          {user && user.email !== ADMIN_EMAIL && (
            <p className="mt-4 text-red-500 text-sm">권한이 없는 계정입니다. ({user.email})</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-xl">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'hero', label: '히어로 섹션', icon: ImageIcon },
            { id: 'stats', label: '통계 수치', icon: Hash },
            { id: 'features', label: '핵심 강점', icon: Layout },
            { id: 'revenue', label: '수익 모델', icon: Type },
            { id: 'products', label: '사업 분야', icon: Layout },
            { id: 'settings', label: '기본 설정', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'hero' && '히어로 섹션 관리'}
              {activeTab === 'stats' && '통계 수치 관리'}
              {activeTab === 'features' && '핵심 강점 관리'}
              {activeTab === 'revenue' && '수익 모델 관리'}
              {activeTab === 'products' && '사업 분야 관리'}
              {activeTab === 'settings' && '기본 설정 관리'}
            </h2>
            <p className="text-gray-500 mt-1">홈페이지의 실시간 데이터를 관리합니다.</p>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 p-8">
          {activeTab === 'hero' && <HeroManager />}
          {activeTab === 'stats' && <StatsManager />}
          {activeTab === 'features' && <FeaturesManager />}
          {activeTab === 'revenue' && <RevenueManager />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}

// --- Managers ---

function HeroManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const q = query(collection(db, 'hero_slides'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setSlides(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleSave = async (id: string, data: any) => {
    await updateDoc(doc(db, 'hero_slides', id), data);
  };

  const handleAdd = async () => {
    const newSlide = {
      url: "https://images.unsplash.com/photo-1591491640784-3232eb748d4b?auto=format&fit=crop&q=80&w=1920",
      title: "새로운 제목",
      highlight: "강조 텍스트",
      subtitle: "부제목 내용을 입력하세요.",
      order: slides.length
    };
    await addDoc(collection(db, 'hero_slides'), newSlide);
    fetchSlides();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'hero_slides', id));
    fetchSlides();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700">
          <Plus size={20} /> 슬라이드 추가
        </button>
      </div>
      <div className="grid gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">이미지 URL</label>
                  <input 
                    type="text" 
                    defaultValue={slide.url} 
                    onBlur={(e) => handleSave(slide.id, { url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">메인 제목</label>
                  <input 
                    type="text" 
                    defaultValue={slide.title} 
                    onBlur={(e) => handleSave(slide.id, { title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">강조 텍스트</label>
                  <input 
                    type="text" 
                    defaultValue={slide.highlight} 
                    onBlur={(e) => handleSave(slide.id, { highlight: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">부제목</label>
                  <textarea 
                    rows={3}
                    defaultValue={slide.subtitle} 
                    onBlur={(e) => handleSave(slide.id, { subtitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none" 
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">순서</label>
                    <input 
                      type="number" 
                      defaultValue={slide.order} 
                      onBlur={(e) => handleSave(slide.id, { order: parseInt(e.target.value) })}
                      className="w-24 px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 outline-none" 
                    />
                  </div>
                  <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsManager() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const q = query(collection(db, 'stats'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setStats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleSave = async (id: string, data: any) => {
    await updateDoc(doc(db, 'stats', id), data);
  };

  const handleAdd = async () => {
    await addDoc(collection(db, 'stats'), { label: '새 라벨', value: '0', order: stats.length });
    fetchStats();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'stats', id));
    fetchStats();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> 통계 추가
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="border border-gray-200 rounded-2xl p-6 space-y-4">
            <input 
              type="text" 
              defaultValue={stat.label} 
              onBlur={(e) => handleSave(stat.id, { label: e.target.value })}
              className="w-full text-sm font-bold text-gray-500 uppercase tracking-widest outline-none focus:text-green-600"
            />
            <input 
              type="text" 
              defaultValue={stat.value} 
              onBlur={(e) => handleSave(stat.id, { value: e.target.value })}
              className="w-full text-3xl font-black text-green-600 outline-none"
            />
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <input 
                type="number" 
                defaultValue={stat.order} 
                onBlur={(e) => handleSave(stat.id, { order: parseInt(e.target.value) })}
                className="w-16 text-sm outline-none"
              />
              <button onClick={() => handleDelete(stat.id)} className="text-red-400 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesManager() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    const q = query(collection(db, 'features'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setFeatures(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleSave = async (id: string, data: any) => {
    await updateDoc(doc(db, 'features', id), data);
  };

  const handleAdd = async () => {
    await addDoc(collection(db, 'features'), { icon: 'Clock', title: '새 강점', desc: '설명을 입력하세요.', order: features.length });
    fetchFeatures();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'features', id));
    fetchFeatures();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> 강점 추가
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.id} className="border border-gray-200 rounded-2xl p-6 space-y-4">
            <input 
              type="text" 
              defaultValue={feature.icon} 
              onBlur={(e) => handleSave(feature.id, { icon: e.target.value })}
              className="w-full text-sm font-mono text-green-600 outline-none"
              placeholder="Lucide Icon Name"
            />
            <input 
              type="text" 
              defaultValue={feature.title} 
              onBlur={(e) => handleSave(feature.id, { title: e.target.value })}
              className="w-full text-xl font-bold outline-none"
            />
            <textarea 
              rows={3}
              defaultValue={feature.desc} 
              onBlur={(e) => handleSave(feature.id, { desc: e.target.value })}
              className="w-full text-gray-600 outline-none resize-none"
            />
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <input 
                type="number" 
                defaultValue={feature.order} 
                onBlur={(e) => handleSave(feature.id, { order: parseInt(e.target.value) })}
                className="w-16 text-sm outline-none"
              />
              <button onClick={() => handleDelete(feature.id)} className="text-red-400 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueManager() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const q = query(collection(db, 'revenue_models'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setModels(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleSave = async (id: string, data: any) => {
    await updateDoc(doc(db, 'revenue_models', id), data);
  };

  const handleAdd = async () => {
    await addDoc(collection(db, 'revenue_models'), { icon: 'Store', title: '새 모델', desc: '설명', price: '월 000만', order: models.length });
    fetchModels();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'revenue_models', id));
    fetchModels();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> 수익 모델 추가
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {models.map((model) => (
          <div key={model.id} className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <input 
              type="text" 
              defaultValue={model.icon} 
              onBlur={(e) => handleSave(model.id, { icon: e.target.value })}
              className="w-full text-sm font-mono text-green-600 outline-none bg-transparent"
            />
            <input 
              type="text" 
              defaultValue={model.title} 
              onBlur={(e) => handleSave(model.id, { title: e.target.value })}
              className="w-full text-xl font-bold outline-none bg-transparent"
            />
            <textarea 
              rows={2}
              defaultValue={model.desc} 
              onBlur={(e) => handleSave(model.id, { desc: e.target.value })}
              className="w-full text-gray-600 text-sm outline-none bg-transparent resize-none"
            />
            <input 
              type="text" 
              defaultValue={model.price} 
              onBlur={(e) => handleSave(model.id, { price: e.target.value })}
              className="w-full text-green-600 font-bold outline-none bg-transparent"
            />
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <input 
                type="number" 
                defaultValue={model.order} 
                onBlur={(e) => handleSave(model.id, { order: parseInt(e.target.value) })}
                className="w-16 text-sm outline-none bg-transparent"
              />
              <button onClick={() => handleDelete(model.id)} className="text-red-400 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const q = query(collection(db, 'products'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleSave = async (id: string, data: any) => {
    await updateDoc(doc(db, 'products', id), data);
  };

  const handleAdd = async () => {
    await addDoc(collection(db, 'products'), { 
      title: '새 사업 분야', 
      subtitle: '설명', 
      imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800',
      features: ['기능 1', '기능 2'],
      order: products.length,
      layout: 'grid'
    });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    fetchProducts();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> 사업 분야 추가
        </button>
      </div>
      <div className="grid gap-8">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-3xl p-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">이미지 URL</label>
                  <input 
                    type="text" 
                    defaultValue={product.imageUrl} 
                    onBlur={(e) => handleSave(product.id, { imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
                  />
                </div>
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-100">
                  <img src={product.imageUrl} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                    <input 
                      type="text" 
                      defaultValue={product.title} 
                      onBlur={(e) => handleSave(product.id, { title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">부제목</label>
                    <input 
                      type="text" 
                      defaultValue={product.subtitle} 
                      onBlur={(e) => handleSave(product.id, { subtitle: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">주요 기능 (쉼표로 구분)</label>
                  <input 
                    type="text" 
                    defaultValue={product.features.join(', ')} 
                    onBlur={(e) => handleSave(product.id, { features: e.target.value.split(',').map((s: string) => s.trim()) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">레이아웃</label>
                      <select 
                        defaultValue={product.layout}
                        onChange={(e) => handleSave(product.id, { layout: e.target.value })}
                        className="px-4 py-2 rounded-lg border border-gray-200 outline-none"
                      >
                        <option value="grid">그리드 (1/3)</option>
                        <option value="full">전체 (Full)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">순서</label>
                      <input 
                        type="number" 
                        defaultValue={product.order} 
                        onBlur={(e) => handleSave(product.id, { order: parseInt(e.target.value) })}
                        className="w-24 px-4 py-2 rounded-lg border border-gray-200 outline-none" 
                      />
                    </div>
                  </div>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'seeding' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSettings(docSnap.data());
    } else {
      const initial = {
        brandName: '파크사랑방',
        logoUrl: '',
        contactPhone: '1661-6842',
        contactEmail: 'info@parksarang.co.kr',
        address: '서울특별시 강남구 테헤란로 123, 4층 (파크빌딩)',
        footerDescription: '파크사랑방은 시니어 건강과 즐거움을 위한 최고의 파크골프 환경을 제공합니다. 차별화된 기술력과 서비스로 파크골프의 새로운 기준을 제시합니다.'
      };
      await setDoc(docRef, initial);
      setSettings(initial);
    }
    setLoading(false);
  };

  const handleSave = async (data: any) => {
    await updateDoc(doc(db, 'settings', 'site'), data);
    setSettings({ ...settings, ...data });
  };

  const handleSeedData = async () => {
    try {
      setSeedStatus('seeding');
      
      // Hero Slides
      const heroSlides = [
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
      ];
      for (const slide of heroSlides) {
        await addDoc(collection(db, 'hero_slides'), slide);
      }

      // Stats
      const stats = [
        { label: '설치 기간', value: '3일', order: 0 },
        { label: '수익 모델', value: '4가지', order: 1 },
        { label: '전국 지점', value: '200+', order: 2 },
        { label: '월 예상 수익', value: '1,000만+', order: 3 },
      ];
      for (const stat of stats) {
        await addDoc(collection(db, 'stats'), stat);
      }

      // Settings
      const initialSettings = {
        brandName: '파크사랑방',
        logoUrl: '',
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
      };
      await setDoc(doc(db, 'settings', 'site'), initialSettings);

      // Features
      const features = [
        { icon: 'Clock', title: '3일 완성 시스템', desc: '설계부터 시공까지 단 3일이면 오픈 가능합니다.', order: 0 },
        { icon: 'TrendingUp', title: '복합 수익 구조', desc: '이용료, 용품, 교육, 회원제 4가지 수익 모델.', order: 1 },
        { icon: 'Building2', title: '저비용 창업', desc: '조립식 부스와 최적화된 인테리어로 비용 최소화.', order: 2 },
        { icon: 'Award', title: '최고의 품질', desc: '검증된 스크린 장비와 프리미엄 파크골프 용품.', order: 3 },
        { icon: 'Users', title: '전문 아카데미', desc: '본사 교육 노하우 전수로 초보자도 운영 가능.', order: 4 },
        { icon: 'Store', title: '무인 운영 가능', desc: '스마트 시스템 도입으로 효율적인 매장 관리.', order: 5 },
      ];
      for (const f of features) {
        await addDoc(collection(db, 'features'), f);
      }

      // Revenue Models
      const revModels = [
        { icon: 'Store', title: '타석 이용료', desc: '시간당 이용 요금으로 발생하는 안정적인 매출', price: '월 400~600만', order: 0 },
        { icon: 'ShoppingBag', title: '용품 판매', desc: '고마진 파크골프채, 공, 액세서리 판매 수익', price: '월 200~400만', order: 1 },
        { icon: 'GraduationCap', title: '아카데미 교육', desc: '레슨 및 지도자 자격증 과정 수강료 수익', price: '월 150~300만', order: 2 },
        { icon: 'CreditCard', title: '회원제 운영', desc: '월/연 단위 회원권 판매로 고정 수익 확보', price: '월 200~500만', order: 3 },
      ];
      for (const m of revModels) {
        await addDoc(collection(db, 'revenue_models'), m);
      }

      // Products
      const products = [
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
      ];
      for (const p of products) {
        await addDoc(collection(db, 'products'), p);
      }

      setSeedStatus('success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Seeding error:", error);
      setSeedStatus('error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
        <h3 className="text-lg font-bold text-blue-800 mb-2">컨텐츠 관리 안내</h3>
        <p className="text-blue-600 text-sm leading-relaxed">
          현재 홈페이지의 모든 컨텐츠(이미지, 텍스트, 수치 등)를 관리자 페이지에서 직접 수정할 수 있도록 구성했습니다. 
          아래 <b>[전체 컨텐츠 데이터베이스 등록]</b> 버튼을 누르면 기존의 모든 내용이 데이터베이스에 저장되어 즉시 편집 가능한 상태가 됩니다.
        </p>
        <button 
          onClick={handleSeedData}
          disabled={seedStatus === 'seeding'}
          className={`mt-4 px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
            seedStatus === 'seeding' ? 'bg-gray-400 cursor-not-allowed' : 
            seedStatus === 'success' ? 'bg-green-600 text-white' :
            seedStatus === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {seedStatus === 'idle' && <><Save size={20} /> 전체 컨텐츠 데이터베이스 등록</>}
          {seedStatus === 'seeding' && <>등록 중...</>}
          {seedStatus === 'success' && <>등록 완료! 잠시 후 새로고침됩니다.</>}
          {seedStatus === 'error' && <>오류 발생. 다시 시도해주세요.</>}
        </button>
      </div>
      <div className="pt-10 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-4">사이트 기본 정보</h3>
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">브랜드명</label>
            <input 
              type="text" 
              defaultValue={settings.brandName} 
              onBlur={(e) => handleSave({ brandName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">로고 이미지 URL</label>
            <div className="flex gap-4 items-center">
              <input 
                type="text" 
                defaultValue={settings.logoUrl} 
                onBlur={(e) => handleSave({ logoUrl: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 outline-none" 
                placeholder="https://example.com/logo.png"
              />
              {settings.logoUrl && (
                <div className="w-12 h-12 border border-gray-100 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                  <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">로고 이미지가 없으면 브랜드명 텍스트가 표시됩니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">대표 번호</label>
              <input 
                type="text" 
                defaultValue={settings.contactPhone} 
                onBlur={(e) => handleSave({ contactPhone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">이메일</label>
              <input 
                type="text" 
                defaultValue={settings.contactEmail} 
                onBlur={(e) => handleSave({ contactEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">주소</label>
            <input 
              type="text" 
              defaultValue={settings.address} 
              onBlur={(e) => handleSave({ address: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">푸터 설명</label>
            <textarea 
              rows={4}
              defaultValue={settings.footerDescription} 
              onBlur={(e) => handleSave({ footerDescription: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
            />
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-4">브랜드 소개 섹션</h3>
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">메인 타이틀 (줄바꿈 가능)</label>
            <textarea 
              rows={2}
              defaultValue={settings.brandIntro?.title} 
              onBlur={(e) => handleSave({ brandIntro: { ...settings.brandIntro, title: e.target.value } })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">상세 설명</label>
            <textarea 
              rows={4}
              defaultValue={settings.brandIntro?.description} 
              onBlur={(e) => handleSave({ brandIntro: { ...settings.brandIntro, description: e.target.value } })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">핵심 포인트 (줄바꿈으로 구분)</label>
            <textarea 
              rows={4}
              defaultValue={settings.brandIntro?.points?.join('\n')} 
              onBlur={(e) => handleSave({ brandIntro: { ...settings.brandIntro, points: e.target.value.split('\n').filter(s => s.trim()) } })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
              placeholder="한 줄에 하나씩 입력하세요"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">배지 수치 (예: 100%)</label>
              <input 
                type="text" 
                defaultValue={settings.brandIntro?.badgeValue} 
                onBlur={(e) => handleSave({ brandIntro: { ...settings.brandIntro, badgeValue: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">배지 라벨 (예: 점주 만족도)</label>
              <input 
                type="text" 
                defaultValue={settings.brandIntro?.badgeLabel} 
                onBlur={(e) => handleSave({ brandIntro: { ...settings.brandIntro, badgeLabel: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">소개 이미지 URL</label>
            <input 
              type="text" 
              defaultValue={settings.brandIntro?.imageUrl} 
              onBlur={(e) => handleSave({ brandIntro: { ...settings.brandIntro, imageUrl: e.target.value } })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
