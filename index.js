const connectBtn = document.getElementById('connectBtn');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        const errorMsg = document.getElementById('errorMsg');
        const networkInfo = document.getElementById('networkInfo');
        const balanceDiv = document.getElementById('balance');

        let currentAccount = null;

        // Función para formatear la dirección de wallet
        function formatAddress(address) {
            return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        }

        // Función para conectar con MetaMask
        async function connectWallet() {
            try {
                // Verificar si MetaMask está instalado
                if (typeof window.ethereum === 'undefined') {
                    // Simular conexión si MetaMask no está instalado
                    simulateConnection();
                    return;
                }

                // Solicitar cuentas de MetaMask
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });

                currentAccount = accounts[0];

                // Obtener información de la red
                const chainId = await window.ethereum.request({ 
                    method: 'eth_chainId' 
                });

                // Obtener balance
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [currentAccount, 'latest']
                });

                // Convertir balance de Wei a ETH
                const ethBalance = parseInt(balance, 16) / 1e18;

                // Mostrar información
                displayWalletInfo(currentAccount, chainId, ethBalance);

                // Escuchar cambios de cuenta
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', () => window.location.reload());

            } catch (error) {
                showError('Error al conectar: ' + error.message);
                console.error(error);
            }
        }

        // Función para simular conexión (cuando no hay MetaMask)
        function simulateConnection() {
            const simulatedAddress = '0xA12F7834B8E92F63C21AB5D6E8F9A3B2C4D5E6F7';
            const simulatedChain = '0x1'; // Ethereum Mainnet
            const simulatedBalance = 1.234;

            currentAccount = simulatedAddress;
            displayWalletInfo(simulatedAddress, simulatedChain, simulatedBalance);

            showError('⚠️ Modo simulación: MetaMask no detectado. Mostrando wallet de ejemplo.');
        }

        // Función para mostrar información de la wallet
        function displayWalletInfo(address, chainId, balance) {
            walletAddress.textContent = `Wallet conectada: ${formatAddress(address)}`;
            
            // Mapeo de chains
            const networks = {
                '0x1': 'Ethereum Mainnet',
                '0x5': 'Goerli Testnet',
                '0x89': 'Polygon Mainnet',
                '0xa': 'Optimism',
                '0xa4b1': 'Arbitrum One'
            };

            networkInfo.textContent = `Red: ${networks[chainId] || 'Red desconocida'}`;
            balanceDiv.textContent = `Balance: ${balance.toFixed(4)} ETH`;

            walletInfo.classList.add('show');
            connectBtn.textContent = '✅ Conectado';
            connectBtn.disabled = true;
        }

        // Manejar cambios de cuenta
        function handleAccountsChanged(accounts) {
            if (accounts.length === 0) {
                // Usuario desconectó su wallet
                resetConnection();
            } else if (accounts[0] !== currentAccount) {
                currentAccount = accounts[0];
                window.location.reload();
            }
        }

        // Resetear conexión
        function resetConnection() {
            walletInfo.classList.remove('show');
            connectBtn.textContent = '🔗 Conectar Wallet';
            connectBtn.disabled = false;
            currentAccount = null;
        }

        // Mostrar error
        function showError(message) {
            errorMsg.textContent = message;
            errorMsg.classList.add('show');
            setTimeout(() => {
                errorMsg.classList.remove('show');
            }, 5000);
        }

        // Event listener para el botón
        connectBtn.addEventListener('click', connectWallet);

        // Verificar si ya hay una conexión activa al cargar la página
        window.addEventListener('load', async () => {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts' 
                });
                if (accounts.length > 0) {
                    connectWallet();
                }
            }
        });