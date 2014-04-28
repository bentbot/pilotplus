function symbolSwitch(symbol) {
    switch (symbol) {
      case '^DJI':
        symbol = 'DOW'
      break;
      case 'CLM14.NYM':
        symbol = 'OIL'
      break;
      case 'GCM14.CMX':
        symbol = 'GOLD'
      break;
      case '^GSPC':
        symbol = 'SP500'
      break;
      case '^IXIC':
        symbol = 'NASDAQ'
      break;
      case '^SLVSY':
        symbol = 'SILVER'
      break;
    }
    return symbol;
}