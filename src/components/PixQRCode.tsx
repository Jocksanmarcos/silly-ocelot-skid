import { QRCodeCanvas } from "qrcode.react";

interface PixQRCodeProps {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  txid?: string;
  amount?: number;
  size?: number;
}

const PixQRCode = ({
  pixKey,
  merchantName,
  merchantCity,
  txid = '***',
  amount,
  size = 160,
}: PixQRCodeProps) => {
  
  const formatField = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const crc16 = (data: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  const getPayload = (): string => {
    const payloadParts = [
      formatField('00', '01'), // Payload Format Indicator
      formatField('26', 
        formatField('00', 'BR.GOV.BCB.PIX') +
        formatField('01', pixKey.replace(/\D/g, ''))
      ),
      formatField('52', '0000'), // Merchant Category Code
      formatField('53', '986'), // Transaction Currency (BRL)
    ];

    if (amount) {
      payloadParts.push(formatField('54', amount.toFixed(2)));
    }

    payloadParts.push(
      formatField('58', 'BR'), // Country Code
      formatField('59', merchantName), // Merchant Name
      formatField('60', merchantCity), // Merchant City
      formatField('62', formatField('05', txid)), // Additional Data Field (TxID)
    );

    const payload = payloadParts.join('');
    const payloadWithCrcId = `${payload}6304`;
    const checksum = crc16(payloadWithCrcId);

    return `${payloadWithCrcId}${checksum}`;
  };

  const pixPayload = getPayload();

  return (
    <div className="p-2 bg-white mx-auto flex items-center justify-center rounded-md w-fit">
      <QRCodeCanvas value={pixPayload} size={size} />
    </div>
  );
};

export default PixQRCode;