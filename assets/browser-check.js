const MIN_CHROME = 111;
        const MIN_SAFARI = 16.4;
        const MIN_FIREFOX = 128;
        const STYLES_TO_DELETE = [];
        let legacyCSSLoaded = false; 

        function isLegacyBrowser() {
          const ua = navigator.userAgent;

          const chrome = ua.match(/Chrome\/([0-9]+)/);
          if (chrome && parseInt(chrome[1]) < MIN_CHROME) return true;

          const safari = ua.match(/Version\/([0-9.]+).*Safari/);
          if (safari && parseFloat(safari[1]) < MIN_SAFARI) return true;

          const firefox = ua.match(/Firefox\/([0-9]+)/);
          if (firefox && parseInt(firefox[1]) < MIN_FIREFOX) return true;

          return false;
        }

         function checkBrowser() {
          if (legacyCSSLoaded) return; 
            if (isLegacyBrowser()) {
            legacyCSSLoaded = true;
                if (STYLES_TO_DELETE.length > 0) {
                  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                    const href = link.getAttribute('href') || '';
                    const fileName = href.split('/').pop().split('?')[0];
                    
                    const shouldDelete = STYLES_TO_DELETE.some(styleName => 
                      fileName === styleName || 
                      fileName.startsWith(styleName + '.') ||
                      fileName.startsWith(styleName + '-')
                    );
                    if (shouldDelete) {
                      link.remove();
                    }
                  });
              } else {
                  document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());
              }
              
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = '/assets/tailwind-v3-legacy.css';
              document.head.appendChild(link);
            }
          }


        checkBrowser();
        document.addEventListener('DOMContentLoaded', checkBrowser);