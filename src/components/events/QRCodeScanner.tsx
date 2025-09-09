import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, QrcodeSuccessCallback } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScanSuccess: QrcodeSuccessCallback;
  onScanFailure: (error: string) => void;
}

const QRCodeScanner = ({ onScanSuccess, onScanFailure }: QRCodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(onScanSuccess, (error) => {
      // A biblioteca chama isso frequentemente, então só logamos se for um erro real
      // console.warn(`QR Code scan error: ${error}`);
      // onScanFailure(error);
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Falha ao limpar o scanner de QR Code.", error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="qr-reader" className="w-full max-w-md mx-auto"></div>;
};

export default QRCodeScanner;