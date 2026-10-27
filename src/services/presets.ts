import { GroundZone, MapTheme } from '../types/game';

export const AVATAR_EMOJIS = ['🦊', '🐼', '🦁', '🐸', '🐯', '🐰', '🐨', '🐵', '🦉', '🐱', '🐶', '🦄', '🐧', '🐙', '🦖', '🐝'];

export const PARACHUTE_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export interface PresetClass {
  id: string;
  name: string;
  description: string;
  names: string[];
}

export const PRESET_CLASSES: PresetClass[] = [
  {
    id: 'class_10a1',
    name: 'Lớp 10A1 (Chuẩn)',
    description: '28 học sinh phổ biến trong lớp học',
    names: [
      'Nguyễn Văn An',
      'Trần Thị Bảo Trâm',
      'Lê Hoàng Long',
      'Phạm Minh Quân',
      'Đỗ Mai Anh',
      'Vũ Tuấn Kiệt',
      'Bùi Phương Linh',
      'Hoàng Đức Thắng',
      'Đinh Quốc Huy',
      'Ngô Thảo Nguyên',
      'Dương Gia Bảo',
      'Phan Ngọc Diệp',
      'Trịnh Tiến Đạt',
      'Lý Khánh Vy',
      'Võ Hải Đăng',
      'Lâm Gia Hân',
      'Hà Trọng Nhân',
      'Mai Hương Giang',
      'Tạ Quang Minh',
      'Cao Ngọc Ánh',
      'Lưu Thành Nam',
      'Đoàn Bảo Ngọc',
      'Chu Việt Anh',
      'Phùng Yến Nhi',
      'Lương Hữu Phước',
      'Nông Thùy Dung',
      'Thái Sơn Tùng',
      'Đặng Quỳnh Nga',
    ],
  },
  {
    id: 'class_fast',
    name: 'Tổ 1 & Tổ 2 (Nhóm nhanh)',
    description: '14 học sinh gọn gàng cho vòng chơi nhanh',
    names: [
      'Minh Khang',
      'Hà My',
      'Gia Huy',
      'Bảo Châu',
      'Tuấn Anh',
      'Khánh Linh',
      'Hoàng Nam',
      'Thu Thảo',
      'Việt Dũng',
      'Phương Nga',
      'Thanh Tùng',
      'Ngọc Mai',
      'Quốc Anh',
      'Trúc Quỳnh',
    ],
  },
  {
    id: 'streamer_giveaway',
    name: 'Streamer & Mini Game',
    description: '16 nickname viewer quay thưởng',
    names: [
      'GamerPro99',
      'MèoBéoUu',
      'ThợSănSao',
      'BéHeoXinh',
      'CậuBaBếnTre',
      'IronMan_VN',
      'TràSữaFullTopping',
      'HackerAoMa',
      'BầuTrờiXanh',
      'NinjaRùa',
      'VuaBánHàng',
      'ChúaTểLivestream',
      'CaptainVietnam',
      'CàPhêMuối',
      'SuperStar2k',
      'ThầnĐènAladdin',
    ],
  },
  {
    id: 'team_building',
    name: 'Team Building Công Ty',
    description: '12 đồng nghiệp phạt thử thách',
    names: [
      'Sếp Hùng',
      'Chị Lan Kế Toán',
      'Huy Dev Backend',
      'Mai HR Xinh Đẹp',
      'Duy Designer',
      'Tùng Marketing',
      'Linh QA Bắt Lỗi',
      'Nam Sales Siêu Cấp',
      'Trang Content',
      'Bình DevOps',
      'Chi Admin',
      'Phúc Intern Hăng Hái',
    ],
  },
];

export function getZonesForTheme(theme: MapTheme): GroundZone[] {
  switch (theme) {
    case 'TROPICAL_ISLAND':
      return [
        {
          id: 'z1',
          name: 'Vùng Biển Sâu',
          type: 'SAFE',
          startRatio: 0.0,
          endRatio: 0.18,
          color: '#0284C7',
          label: 'Vùng Biển',
          sublabel: 'Rơi xuống nước (An toàn)',
        },
        {
          id: 'z2',
          name: 'Bãi Cát Vàng',
          type: 'SAFE',
          startRatio: 0.18,
          endRatio: 0.36,
          color: '#10B981',
          label: 'Bờ Cát Xanh',
          sublabel: 'Hạ cánh êm đềm',
        },
        {
          id: 'z3',
          name: 'VÙNG NGUY HIỂM / NÚI LỬA',
          type: 'CHALLENGE',
          startRatio: 0.36,
          endRatio: 0.64,
          color: '#EF4444',
          label: 'VÙNG TRẢ BÀI ⚠️',
          sublabel: 'Tâm chấn Thử Thách!',
        },
        {
          id: 'z4',
          name: 'Rừng Dừa May Mắn',
          type: 'LUCKY',
          startRatio: 0.64,
          endRatio: 0.82,
          color: '#F59E0B',
          label: 'RƯƠNG VÀNG 🎁',
          sublabel: 'Trúng Thưởng / +10 Điểm',
        },
        {
          id: 'z5',
          name: 'Vùng Đầm Lầy',
          type: 'SAFE',
          startRatio: 0.82,
          endRatio: 1.0,
          color: '#059669',
          label: 'Đầm Sen',
          sublabel: 'An toàn thoát nạn',
        },
      ];

    case 'CYBER_CITY':
      return [
        {
          id: 'z1',
          name: 'Khu Nhà Cao Tầng',
          type: 'SAFE',
          startRatio: 0.0,
          endRatio: 0.22,
          color: '#3B82F6',
          label: 'Sân Bay Trực Thăng',
          sublabel: 'Tiếp đất êm',
        },
        {
          id: 'z2',
          name: 'TRẠM NĂNG LƯỢNG ĐỎ',
          type: 'CHALLENGE',
          startRatio: 0.22,
          endRatio: 0.52,
          color: '#EF4444',
          label: 'VÙNG BÁO ĐỘNG 🚨',
          sublabel: 'Kích hoạt thử thách!',
        },
        {
          id: 'z3',
          name: 'Kho Báu Cyber Matrix',
          type: 'LUCKY',
          startRatio: 0.52,
          endRatio: 0.76,
          color: '#F59E0B',
          label: 'QUÀ CYBER 💎',
          sublabel: 'Tặng quà đặc biệt',
        },
        {
          id: 'z4',
          name: 'Đường Hầm Neon',
          type: 'SAFE',
          startRatio: 0.76,
          endRatio: 1.0,
          color: '#6366F1',
          label: 'Khu Dân Cư',
          sublabel: 'An toàn',
        },
      ];

    case 'COUNTRYSIDE':
      return [
        {
          id: 'z1',
          name: 'Bờ Đê Xanh',
          type: 'SAFE',
          startRatio: 0.0,
          endRatio: 0.25,
          color: '#10B981',
          label: 'Bãi Cỏ Xanh',
          sublabel: 'Chăn trâu thổi sáo',
        },
        {
          id: 'z2',
          name: 'HỐ BÙN NGUY HIỂM',
          type: 'CHALLENGE',
          startRatio: 0.25,
          endRatio: 0.58,
          color: '#DC2626',
          label: 'VÙNG TRẢ BÀI 🎯',
          sublabel: 'Lên bảng giải bài tập!',
        },
        {
          id: 'z3',
          name: 'Vườn Hoa Quả Bội Thu',
          type: 'LUCKY',
          startRatio: 0.58,
          endRatio: 0.82,
          color: '#F59E0B',
          label: 'CÂY TRÁI VÀNG 🍎',
          sublabel: 'Nhận phần thưởng ngọt ngào',
        },
        {
          id: 'z4',
          name: 'Đụn Rơm Quê',
          type: 'SAFE',
          startRatio: 0.82,
          endRatio: 1.0,
          color: '#059669',
          label: 'Sân Phơi Thóc',
          sublabel: 'Hạ cánh êm ru',
        },
      ];

    case 'COSMIC_SPACE':
      return [
        {
          id: 'z1',
          name: 'Trạm Vũ Trụ Alpha',
          type: 'SAFE',
          startRatio: 0.0,
          endRatio: 0.25,
          color: '#6366F1',
          label: 'Sàn Module Trạm',
          sublabel: 'Áp suất ổn định',
        },
        {
          id: 'z2',
          name: 'HỐ ĐEN TỬ THẦN',
          type: 'CHALLENGE',
          startRatio: 0.25,
          endRatio: 0.55,
          color: '#EF4444',
          label: 'HỐ ĐEN TRẢ BÀI 🌌',
          sublabel: 'Hút vào thử thách!',
        },
        {
          id: 'z3',
          name: 'Thiên Thạch Hoàng Kim',
          type: 'LUCKY',
          startRatio: 0.55,
          endRatio: 0.8,
          color: '#F59E0B',
          label: 'QUẶNG VÀNG 🌟',
          sublabel: 'Phần thưởng vũ trụ',
        },
        {
          id: 'z4',
          name: 'Vành Đai Băng Tinh',
          type: 'SAFE',
          startRatio: 0.8,
          endRatio: 1.0,
          color: '#0284C7',
          label: 'Bụi Sao Khí',
          sublabel: 'Trôi nổi an toàn',
        },
      ];
  }
}
