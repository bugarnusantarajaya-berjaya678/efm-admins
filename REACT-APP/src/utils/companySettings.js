// Helper untuk membaca settings perusahaan dari localStorage.
// Nanti diganti dengan API call ke Google Sheets.

export const getCompanySettings = () => {
  try {
    const saved = localStorage.getItem('efmCompanySettings')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error reading company settings:', e)
  }
  return {
    namaPerusahaan: 'Essential Fitness Management',
    namaLegal: 'CV. Bugar Nusantara Jaya',
    alamat: "Jl. Terogong Raya No. 18, Hampton's Park Apartment, Tower A, Cilandak Barat, Jakarta Selatan",
    email: 'essentialfitnessmanagement@gmail.com',
    telepon: '+62 811-1992-0666',
    website: 'www.essentialfitnessmanagement.com',
    whatsapp: '+62 811-1992-0666',
    namaBank: 'BCA',
    nomorRekening: '1234567890',
    atasNamaRekening: 'CV. Bugar Nusantara Jaya',
    logoPerusahaan: '',
    tandaTanganCEO: '',
    namaPenandatangan: 'Bagoes Soeharto',
    jabatanPenandatangan: 'Owner & Co-Founder',
  }
}
