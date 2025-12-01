const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const joinUrl = (base: string, path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
};

// Token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinUrl(DEFAULT_BASE_URL, path);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(`Invalid JSON response from ${url}`, response.status, text);
    }
  }

  if (!response.ok) {
    throw new ApiError(`Request to ${url} failed with status ${response.status}`, response.status, data);
  }

  return data as T;
}

// Authentication API functions
export interface LoginRequest {
  taiKhoan: string;
  matKhau: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    MaNhanVien: string;
    TenNhanVien: string;
    ChucVu: string;
    TaiKhoan: string;
    SoDienThoai?: string;
    GioiTinh?: string;
    NgaySinh?: string;
    TrangThai?: string;
    caLam?: {
      MaCaLam: string;
      TenCaLam: string;
      ThoiGianBatDau: string;
      ThoiGianKetThuc: string;
    };
  };
}

export interface User {
  MaNhanVien: string;
  TenNhanVien: string;
  ChucVu: string;
  TaiKhoan: string;
  SoDienThoai?: string;
  GioiTinh?: string;
  NgaySinh?: string;
  TrangThai?: string;
  caLam?: {
    MaCaLam: string;
    TenCaLam: string;
    ThoiGianBatDau: string;
    ThoiGianKetThuc: string;
  };
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async verifyToken(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>('/api/auth/verify');
  },

  async logout(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },
};

// Generic CRUD API helper
function createCrudApi<T>(endpoint: string) {
  return {
    getAll: (params?: Record<string, string>): Promise<T[]> => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch<T[]>(`${endpoint}${queryString}`);
    },
    getOne: (id: string): Promise<T> => {
      return apiFetch<T>(`${endpoint}/${id}`);
    },
    create: (data: Partial<T>): Promise<T> => {
      return apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: (id: string, data: Partial<T>): Promise<T> => {
      return apiFetch<T>(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: (id: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

// NhanVien API
export interface NhanVien {
  MaNhanVien: string;
  MaCaLam: string;
  TenNhanVien: string;
  SoDienThoai?: string;
  ChucVu: string;
  GioiTinh: string;
  NgaySinh: string;
  TaiKhoan: string;
  MatKhau?: string;
  TrangThai?: string;
  caLam?: {
    MaCaLam: string;
    TenCaLam: string;
    ThoiGianBatDau: string;
    ThoiGianKetThuc: string;
  };
}

export const nhanVienApi = createCrudApi<NhanVien>('/api/nhanvien');

// CaLam API
export interface CaLam {
  MaCaLam: string;
  TenCaLam: string;
  ThoiGianBatDau: string;
  ThoiGianKetThuc: string;
}

export const caLamApi = createCrudApi<CaLam>('/api/calam');

// PhienLamViec API
export interface PhienLamViec {
  MaPhienLamViec: string;
  MaCaLam: string;
  MaNhanVien: string;
  Ngay: string;
  ThoiGianMo?: string;
  ThoiGianDong?: string;
  TrangThai: string;
  caLam?: CaLam;
  nhanVien?: NhanVien;
}

export const phienLamViecApi = {
  ...createCrudApi<PhienLamViec>('/api/phienlamviec'),
  openShift: (maPhienLamViec: string): Promise<PhienLamViec> => {
    return apiFetch<PhienLamViec>('/api/phienlamviec/open-shift', {
      method: 'POST',
      body: JSON.stringify({ maPhienLamViec }),
    });
  },
  closeShift: (maPhienLamViec: string): Promise<PhienLamViec> => {
    return apiFetch<PhienLamViec>('/api/phienlamviec/close-shift', {
      method: 'POST',
      body: JSON.stringify({ maPhienLamViec }),
    });
  },
};

// Mon API
export interface Mon {
  MaMon: string;
  LoaiMon: string;
  NhomMon: string;
  TenMon: string;
  DonGia: number;
  DonViTinh: string;
  TrangThai?: string;
  imgUrl?: string;
}

export const monApi = createCrudApi<Mon>('/api/mon');

// DonHang API
export interface DonHang {
  MaDonHang: string;
  MaPhienLamViec: string;
  MaCTKM?: string;
  Ngay: string;
  PhuongThucThanhToan: string;
  phienLamViec?: PhienLamViec;
  ctkm?: CTKM;
  chiTietDonHangs?: ChiTietDonHang[];
}

export const donHangApi = createCrudApi<DonHang>('/api/hoadon');

// ChiTietDonHang API
export interface ChiTietDonHang {
  MaCTDH: string;
  MaDH: string;
  MaMon: string;
  DonGia: number;
  SoLuong: number;
  donHang?: DonHang;
  mon?: Mon;
  tuyChonDonHangs?: TuyChonDonHang[];
}

export const chiTietDonHangApi = createCrudApi<ChiTietDonHang>('/api/chitiethoadon');

// TheBan API
export interface TheBan {
  MaTheBan: string;
  TenTheBan: string;
  TrangThai: string;
}

export const theBanApi = createCrudApi<TheBan>('/api/theban');

// CTKM API
export interface CTKM {
  MaCTKM: string;
  TenCTKM: string;
  LoaiCTKM: string;
  giamHoaDons?: GiamHoaDon[];
  giamMons?: GiamMon[];
}

export const ctkmApi = createCrudApi<CTKM>('/api/ctkm');

// GiamHoaDon API
export interface GiamHoaDon {
  MaGHD: string;
  MaCTKM: string;
  GiaTriTu?: number;
  SoTienGiam: number;
  LoaiGiam: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  Thu?: string;
  GioBatDau?: string;
  GioKetThuc?: string;
  TrangThai: string;
  ctkm?: CTKM;
}

export const giamHoaDonApi = {
  ...createCrudApi<GiamHoaDon>('/api/giamhoadon'),
  getActiveRules: (): Promise<GiamHoaDon[]> => {
    return apiFetch<GiamHoaDon[]>('/api/giamhoadon/active');
  },
};

// GiamMon API
export interface GiamMon {
  MaGM: string;
  MaCTKM: string;
  MaMon: string;
  SoTienGiam: number;
  LoaiGiam: string;
  ApDungCho?: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  Thu?: string;
  GioBatDau?: string;
  GioKetThuc?: string;
  TrangThai: string;
  ctkm?: CTKM;
  mon?: Mon;
}

export const giamMonApi = {
  ...createCrudApi<GiamMon>('/api/giammon'),
  getActiveRulesForMon: (maMon: string): Promise<GiamMon[]> => {
    return apiFetch<GiamMon[]>(`/api/giammon/mon/${maMon}/active`);
  },
};

// Combo API
export interface Combo {
  MaCombo: string;
  TenCombo: string;
  GiaCombo: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  Thu?: string;
  GioBatDau?: string;
  GioKetThuc?: string;
  TrangThai: string;
  dsMonTrongCombos?: DSMonTrongCombo[];
}

export interface DSMonTrongCombo {
  MaDSMonCombo: string;
  MaMon: string;
  SoLuong: number;
  mon?: Mon;
}

export const comboApi = {
  ...createCrudApi<Combo>('/api/combo'),
  getActiveCombos: (): Promise<Combo[]> => {
    return apiFetch<Combo[]>('/api/combo/active');
  },
};

// ThuChi API
export interface ThuChi {
  MaGiaoDich: string;
  MaPhienLamViec: string;
  MaNghiepVu: string;
  ThoiGian: string;
  PhuongThucThanhToan: string;
  GhiChu?: string;
  SoTien: number;
  phienLamViec?: PhienLamViec;
  nghiepVu?: NghiepVu;
}

export const thuChiApi = {
  ...createCrudApi<ThuChi>('/api/thuchi'),
  getAll: (params?: { startDate?: string; endDate?: string; loaiGiaoDich?: string }): Promise<ThuChi[]> => {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<ThuChi[]>(`/api/thuchi${queryString}`);
  },
  getPaymentMethods: (): Promise<string[]> => {
    return apiFetch<string[]>('/api/thuchi/payment-methods');
  },
};

// NghiepVu API
export interface NghiepVu {
  MaNghiepVu: string;
  LoaiGiaoDich: string;
  TenNghiepVu: string;
}

export const nghiepVuApi = {
  ...createCrudApi<NghiepVu>('/api/nghiepvu'),
  getAll: (params?: { loaiGiaoDich?: string }): Promise<NghiepVu[]> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<NghiepVu[]>(`/api/nghiepvu${queryString}`);
  },
};

// TuyChon API
export interface TuyChon {
  MaTuyChon: string;
  LoaiTuyChon: string;
  TenTuyChon: string;
  GiaCongThem: number;
}

export interface TuyChonDonHang {
  MaTCDH: string;
  MaCTDH: string;
  MaTuyChon: string;
  chiTietDonHang?: ChiTietDonHang;
  tuyChon?: TuyChon;
}

export const tuyChonApi = {
  ...createCrudApi<TuyChon>('/api/tuychon'),
  getAll: (params?: { loaiTuyChon?: string }): Promise<TuyChon[]> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<TuyChon[]>(`/api/tuychon${queryString}`);
  },
};

// ThongKe API
export interface ThongKeOverview {
  totalRevenue: number;
  totalExpense: number;
  grossProfit: number;
  invoiceCount: number;
  period: {
    start: string;
    end: string;
  };
}

export interface TopProduct {
  maMon: string;
  tenMon: string;
  soLuong: string;
  doanhThu: string;
}

export interface RevenueByChannel {
  label: string;
  value: number;
}

export interface MonthlyRevenue {
  month: number;
  revenue: string;
}

export interface ShiftClosingReport {
  phienLamViec: {
    MaPhienLamViec: string;
    Ngay: string;
    ThoiGianMo?: string;
    ThoiGianDong?: string;
    TrangThai: string;
    caLam: CaLam;
    nhanVien: NhanVien;
  };
  tongKet: {
    totalRevenue: number;
    totalGiamGiaMon: number;
    totalChietKhau: number;
    totalVoucherDiscount: number;
    totalThu: number;
    totalChi: number;
    orderCount: number;
    averageOrder: number;
    profit: number;
    soDuDau: number;
    tienTrongKet: number;
    gioIn: string;
  };
  monByNhom: Array<{
    ten: string;
    soLuong: number;
    doanhThu: number;
  }>;
  ctkmStats: Array<{
    ten: string;
    soHoaDon: number;
    doanhThu: number;
  }>;
  paymentMethods: Array<{
    phuongThuc: string;
    soHoaDon: number;
    doanhThu: number;
  }>;
  orderSources: Array<{
    ten: string;
    soHoaDon: number;
    doanhThu: number;
  }>;
  donHangs: DonHang[];
  thuChis: ThuChi[];
}

export interface RevenueComparison {
  today: {
    date: string;
    revenue: number;
    orderCount: number;
  };
  yesterday: {
    date: string;
    revenue: number;
    orderCount: number;
  };
  comparison: {
    difference: number;
    percentChange: number;
    isIncrease: boolean;
  };
}

export interface SevenDaysReport {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageRevenue: number;
    averageOrdersPerDay: number;
  };
  dailyData: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
}

export interface Top10Product {
  rank: number;
  maMon: string;
  tenMon: string;
  loaiMon: string;
  donGia: number;
  soLuong: number;
  doanhThu: number;
}

export interface Top5Category {
  rank: number;
  loaiMon: string;
  soMon: number;
  tongSoLuong: number;
  tongDoanhThu: number;
}

export interface CategoryStats {
  loaiMon: string;
  soMon: number;
  tongSoLuong: number;
  tongDoanhThu: number;
  soDonHang: number;
}

export interface BusinessReport {
  doanhThu: {
    banHang: number;
    khac: number;
    tong: number;
  };
  chiPhi: {
    byCategory: Record<string, number>;
    tong: number;
  };
  loiNhuan: number;
}

export const thongKeApi = {
  getOverview: (params?: { startDate?: string; endDate?: string }): Promise<ThongKeOverview> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<ThongKeOverview>(`/api/thongke/overview${queryString}`);
  },
  getTopProducts: (params?: { limit?: number; startDate?: string; endDate?: string }): Promise<TopProduct[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    const queryString = Object.keys(queryParams).length > 0 ? '?' + new URLSearchParams(queryParams).toString() : '';
    return apiFetch<TopProduct[]>(`/api/thongke/top-products${queryString}`);
  },
  getRevenueByChannel: (params?: { startDate?: string; endDate?: string }): Promise<RevenueByChannel[]> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<RevenueByChannel[]>(`/api/thongke/revenue-by-channel${queryString}`);
  },
  getRevenueByMonth: (params?: { year?: number }): Promise<MonthlyRevenue[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.year) queryParams.year = params.year.toString();
    const queryString = Object.keys(queryParams).length > 0 ? '?' + new URLSearchParams(queryParams).toString() : '';
    return apiFetch<MonthlyRevenue[]>(`/api/thongke/revenue-by-month${queryString}`);
  },
  getShiftClosingReport: (maPhienLamViec: string): Promise<ShiftClosingReport> => {
    return apiFetch<ShiftClosingReport>(`/api/thongke/shift-closing/${maPhienLamViec}`);
  },
  compareRevenueWithYesterday: (): Promise<RevenueComparison> => {
    return apiFetch<RevenueComparison>('/api/thongke/compare-yesterday');
  },
  get7DaysReport: (): Promise<SevenDaysReport> => {
    return apiFetch<SevenDaysReport>('/api/thongke/7days-report');
  },
  getTop10Products: (params?: { startDate?: string; endDate?: string }): Promise<Top10Product[]> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<Top10Product[]>(`/api/thongke/top-10-products${queryString}`);
  },
  getTop5Categories: (params?: { startDate?: string; endDate?: string }): Promise<Top5Category[]> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch<Top5Category[]>(`/api/thongke/top-5-categories${queryString}`);
  },
  getCategoryStats: (params: { loaiMon: string; startDate?: string; endDate?: string }): Promise<CategoryStats> => {
    const queryParams: Record<string, string> = { loaiMon: params.loaiMon };
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    const queryString = '?' + new URLSearchParams(queryParams).toString();
    return apiFetch<CategoryStats>(`/api/thongke/category-stats${queryString}`);
  },
  getBusinessReport: (params?: { startDate?: string; endDate?: string; maPhienLamViec?: string }): Promise<BusinessReport> => {
    const queryParams: Record<string, string> = {};
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.maPhienLamViec) queryParams.maPhienLamViec = params.maPhienLamViec;
    const queryString = Object.keys(queryParams).length > 0 ? '?' + new URLSearchParams(queryParams).toString() : '';
    return apiFetch<BusinessReport>(`/api/thongke/business-report${queryString}`);
  },
};
