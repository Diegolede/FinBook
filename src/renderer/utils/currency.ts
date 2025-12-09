// Configuración de monedas
export const CURRENCY_CONFIG = {
  primary: {
    code: 'ARS',
    symbol: '$',
    name: 'Peso Argentino',
    locale: 'es-AR'
  }
};

// Función para formatear moneda (ARS)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_CONFIG.primary.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.primary.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Función para formatear solo la moneda principal (ARS)
export const formatCurrencyPrimary = (amount: number): string => {
  return formatCurrency(amount);
};

// Función para obtener el símbolo de la moneda
export const getCurrencySymbol = (): string => {
  return CURRENCY_CONFIG.primary.symbol;
}; 