export interface FingerprintData {
  fingerprint: string;
  confidence: number;
}

class BrowserFingerprint {
  private canvas: HTMLCanvasElement | null = null;

  private getCanvasFingerprint(): string {
    try {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 200;
        this.canvas.height = 50;
      }
      
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return '';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('MeroVote 🇳🇵', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('नेपाली मतदान', 4, 30);

      return this.canvas.toDataURL();
    } catch (e) {
      return '';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';

      return [
        gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      ].join('|');
    } catch (e) {
      return '';
    }
  }

  private getTimezoneFingerprint(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return new Date().getTimezoneOffset().toString();
    }
  }

  private getLanguageFingerprint(): string {
    return [
      navigator.language,
      navigator.languages?.join(',') || '',
      navigator.userAgent.slice(0, 100)
    ].join('|');
  }

  private getScreenFingerprint(): string {
    return [
      screen.width,
      screen.height,
      screen.colorDepth,
      screen.pixelDepth,
      window.devicePixelRatio || 1
    ].join('x');
  }

  private getStorageFingerprint(): string {
    try {
      const testKey = 'merovote_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return 'local:true';
    } catch (e) {
      return 'local:false';
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  generateFingerprint(): FingerprintData {
    const components = [
      this.getCanvasFingerprint(),
      this.getWebGLFingerprint(),
      this.getTimezoneFingerprint(),
      this.getLanguageFingerprint(),
      this.getScreenFingerprint(),
      this.getStorageFingerprint(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform,
      navigator.cookieEnabled.toString()
    ];

    const combinedFingerprint = components.join('|');
    const hashedFingerprint = this.simpleHash(combinedFingerprint);
    
    // Calculate confidence based on available components
    const availableComponents = components.filter(c => c && c !== '').length;
    const confidence = Math.min(availableComponents / components.length, 1);

    return {
      fingerprint: hashedFingerprint,
      confidence: Math.round(confidence * 100)
    };
  }
}

export const browserFingerprint = new BrowserFingerprint();
