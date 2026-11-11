// Dataset citations required by ASSET_MANIFEST §4. Checked against the PhysioNet dataset page on 2026-11-11.
export interface Citation {
  text: string;
  url: string;
}
export const PRESSURE_MAT: Citation[] = [
  {
    text: 'M. Baran Pouyan, J. Birjandtalab, M. Heydarzadeh, M. Nourani, S. Ostadabbas. “A pressure map dataset for posture and subject analytics.” IEEE EMBS BHI 2017.',
    url: 'https://doi.org/10.1109/BHI.2017.7897206',
  },
  {
    text: '“A Pressure Map Dataset for In-bed Posture Classification” (pmd) v1.0.0, PhysioNet. Open Data Commons Attribution License v1.0.',
    url: 'https://doi.org/10.13026/C2W09K',
  },
  {
    text: 'Pollard T., Moody B. E., Lehman L., Gow B., Fernandes C., Xie C., Johnson A., Mark R. G., Heldt T. “PhysioNet as a global platform for biomedical research.” Nature Health (2026).',
    url: 'https://doi.org/10.1038/s44360-026-00096-z',
  },
];

// Other public datasets, named as in each repository's README.
export const OTHER_DATA: (Citation & { used: string })[] = [
  {
    used: 'Dark-store supply chain',
    text: 'M5 Forecasting competition data (Walmart US daily sales, 2011–2016; this project uses 2014–2016), Kaggle.',
    url: 'https://www.kaggle.com/competitions/m5-forecasting-accuracy',
  },
  {
    used: 'CFPB complaint analytics (Lab)',
    text: 'Consumer Financial Protection Bureau, Consumer Complaint Database.',
    url: 'https://www.consumerfinance.gov/data-research/consumer-complaints/',
  },
  {
    used: 'Email campaign uplift (Lab)',
    text: 'Kevin Hillstrom, MineThatData E-Mail Analytics and Data Mining Challenge (2008).',
    url: 'https://blog.minethatdata.com/2008/03/minethatdata-e-mail-analytics-and-data.html',
  },
  {
    used: 'Retention, win-back and loyalty (Lab)',
    text: 'Online Retail dataset, UCI Machine Learning Repository.',
    url: 'https://archive.ics.uci.edu/dataset/352/online+retail',
  },
];
