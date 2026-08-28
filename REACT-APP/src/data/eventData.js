export const eventDocuments = [
  {
    id: '#EV-DOC-001', klien: 'Apartemen Green Lake',    jenis: 'Kontrak', tglUpload: '1 Jan 2026',  berlakuHingga: '31 Des 2026',
    status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'kontrak-green-lake-ev-v1.pdf', uploadedAt: '1 Jan 2026' },
      { version: 'v2', fileName: 'kontrak-green-lake-ev-v2.pdf', uploadedAt: '8 Jan 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/ev-example-001',
  },
  {
    id: '#EV-DOC-002', klien: 'PT. Maju Bersama',        jenis: 'MOU',     tglUpload: '5 Jan 2026',  berlakuHingga: '31 Des 2026',
    status: 'on_review',
    revisions: [
      { version: 'v1', fileName: 'mou-maju-bersama-ev-v1.pdf', uploadedAt: '5 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: '#EV-DOC-003', klien: 'Apartemen Sudirman Park', jenis: 'Kontrak', tglUpload: '10 Jan 2026', berlakuHingga: '5 Jul 2026',
    status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'kontrak-sudirman-park-ev-v1.pdf', uploadedAt: '10 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: '#EV-DOC-004', klien: 'CV. Teknologi Prima',     jenis: 'LOI',     tglUpload: '15 Des 2025', berlakuHingga: '22 Jun 2026',
    status: 'revision',
    revisions: [
      { version: 'v1', fileName: 'loi-teknologi-prima-ev-v1.pdf', uploadedAt: '15 Des 2025' },
      { version: 'v2', fileName: 'loi-teknologi-prima-ev-v2.pdf', uploadedAt: '3 Jan 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/ev-example-004',
  },
  {
    id: '#EV-DOC-005', klien: 'PT. Sinar Abadi',         jenis: 'MOU',     tglUpload: '20 Jan 2026', berlakuHingga: '20 Jan 2027',
    status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'mou-sinar-abadi-ev-v1.pdf', uploadedAt: '20 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: '#EV-DOC-006', klien: 'Apartemen Permata Hijau', jenis: 'Kontrak', tglUpload: '3 Feb 2026',  berlakuHingga: '3 Feb 2027',
    status: 'drafting',
    revisions: [],
    googleDocsUrl: 'https://docs.google.com/document/d/ev-example-006',
  },
]

export const EV_DOC_STATUS_CLS = {
  drafting:  'bg-gray-100 text-gray-500 border border-gray-200',
  on_review: 'bg-[#EBF5FB] text-[#1A5276] border border-[#AED6F1]',
  revision:  'bg-[#FEF9E7] text-[#B7770D] border border-[#FAD7A0]',
  signed:    'bg-[#EAFAF1] text-[#1E8449] border border-[#A9DFBF]',
}
export const EV_DOC_STATUS_LABEL = {
  drafting: 'Drafting', on_review: 'On Review', revision: 'Revision', signed: 'Signed',
}
