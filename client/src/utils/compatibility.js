// Extract Socket string from specs
const extractSocket = (specs) => {
  if (!specs) return null;
  // Look through values for socket keywords like LGA1700, AM4, AM5, LGA1200, LGA 1700
  const values = Object.values(specs).map(v => String(v).toUpperCase());
  for (const v of values) {
    if (v.includes('LGA') || v.includes('AM4') || v.includes('AM5') || v.includes('TRX40')) {
      // Return normalized socket string
      const match = v.match(/(LGA\s*\d+|AM[45]|TRX40)/i);
      if (match) return match[1].replace(/\s+/g, '').toUpperCase();
    }
  }
  return null;
};

// Extract DDR type from specs
const extractRAMType = (specs) => {
  if (!specs) return null;
  const values = Object.values(specs).map(v => String(v).toUpperCase());
  for (const v of values) {
    if (v.includes('DDR5')) return 'DDR5';
    if (v.includes('DDR4')) return 'DDR4';
    if (v.includes('DDR3')) return 'DDR3';
  }
  return null;
};

// Extract TDP/Power from specs (returns number in Watts)
const extractWattage = (specs) => {
  if (!specs) return 0;
  const values = Object.values(specs).map(v => String(v).toUpperCase());
  for (const v of values) {
    // Looks for 750W, 1000W, 650 W
    const match = v.match(/(\d+)\s*W/);
    if (match) return parseInt(match[1]);
  }
  return 0;
};

export const checkCompatibility = (config) => {
  const warnings = [];

  const cpu = config['cpu']?.product;
  const mainboard = config['mainboard']?.product;
  const ram = config['ram']?.product;
  const psu = config['psu']?.product;
  const vga = config['vga']?.product;

  let totalTDP = 0;

  // CPU vs Mainboard Socket Check
  let cpuSocket = null;
  let mbSocket = null;
  if (cpu) {
    cpuSocket = extractSocket(cpu.specs);
    // Rough fallback TDP if not found in specs (for Intel Core/AMD Ryzen)
    totalTDP += extractWattage(cpu.specs) || 125; 
  }
  if (mainboard) mbSocket = extractSocket(mainboard.specs);

  if (cpu && mainboard && cpuSocket && mbSocket && cpuSocket !== mbSocket) {
    warnings.push(`Cảnh báo: CPU (Socket ${cpuSocket}) có thể không tương thích với Mainboard (Hỗ trợ ${mbSocket}).`);
  }

  // RAM vs Mainboard Check
  let mbRamType = null;
  let ramType = null;
  if (mainboard) mbRamType = extractRAMType(mainboard.specs);
  if (ram) ramType = extractRAMType(ram.specs);

  if (mainboard && ram && mbRamType && ramType && mbRamType !== ramType) {
    warnings.push(`Cảnh báo: RAM (${ramType}) không lắp được vào Mainboard này (hỗ trợ ${mbRamType}).`);
  }

  // TDP vs PSU Check
  if (vga) {
    // Rough fallback if not found
    const vgaTDP = extractWattage(vga.specs) || 250;
    // Account for multiple VGAs if quantity > 1
    totalTDP += vgaTDP * config['vga'].quantity;
  }
  
  // Add some buffer for other components (motherboard, fans, storage)
  totalTDP += 50;

  if (psu) {
    const psuWattage = extractWattage(psu.specs);
    if (psuWattage && psuWattage < totalTDP * 1.2) {
      warnings.push(`Cảnh báo điện áp: Nguồn ${psuWattage}W của bạn có thể bị đuối. Hệ thống ước tính cần ít nhất Nguồn ${(Math.ceil((totalTDP * 1.3) / 50) * 50)}W.`);
    }
  }

  return { warnings, totalTDP };
};

export const checkItemCompatibility = (itemProduct, categoryId, currentConfig) => {
  // itemProduct is the product being browsed in the Modal
  // categoryId is 'cpu', 'mainboard', 'ram', etc.
  
  if (categoryId === 'mainboard') {
    const cpu = currentConfig['cpu']?.product;
    if (cpu) {
      const cpuSocket = extractSocket(cpu.specs);
      const itemSocket = extractSocket(itemProduct.specs);
      if (cpuSocket && itemSocket && cpuSocket !== itemSocket) {
        return `Không khớp Socket với CPU đã chọn (${cpuSocket})`;
      }
    }
  }
  
  if (categoryId === 'cpu') {
    const mb = currentConfig['mainboard']?.product;
    if (mb) {
      const mbSocket = extractSocket(mb.specs);
      const itemSocket = extractSocket(itemProduct.specs);
      if (mbSocket && itemSocket && mbSocket !== itemSocket) {
        return `Không khớp Socket với Mainboard đã chọn (${mbSocket})`;
      }
    }
  }
  
  if (categoryId === 'ram') {
    const mb = currentConfig['mainboard']?.product;
    if (mb) {
      const mbRamType = extractRAMType(mb.specs);
      const itemRamType = extractRAMType(itemProduct.specs);
      if (mbRamType && itemRamType && mbRamType !== itemRamType) {
        return `Mainboard chỉ hỗ trợ chuẩn ${mbRamType}`;
      }
    }
  }

  return null; // Compatible
};
