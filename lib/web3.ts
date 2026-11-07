import Web3 from 'web3';

// Simulated & standard ERC-20 ABI for $ADX Abu Dhabi City Token
export const ADX_TOKEN_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: '_recipient', type: 'address' }, { name: '_amount', type: 'uint256' }],
    name: 'faucet',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
] as const;

// ERC-721 District NFT ABI
export const AD_LAND_NFT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', type: 'address' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_district', type: 'string' },
    ],
    name: 'mintDistrictDeed',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    type: 'function',
  },
] as const;

// Contract addresses (Polygon/Arbitrum/Sepolia or Mock)
export const ADX_CONTRACT_ADDRESS = '0xAD001971EAE00000000000000000000000000001';
export const LAND_NFT_CONTRACT_ADDRESS = '0xAD001971EAE00000000000000000000000000002';

export interface Web3ProviderService {
  web3: Web3 | null;
  isMock: boolean;
}

export class Web3GameManager {
  private static instance: Web3GameManager;
  public web3: Web3 | null = null;
  public isSimulated: boolean = false;
  private mockBalances: Map<string, number> = new Map();
  private mockNFTs: Map<string, string[]> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      const anyWindow = window as any;
      if (anyWindow.ethereum) {
        this.web3 = new Web3(anyWindow.ethereum);
        this.isSimulated = false;
      } else {
        // Fallback to local simulated web3 provider
        this.web3 = new Web3();
        this.isSimulated = true;
      }
    }
  }

  public static getInstance(): Web3GameManager {
    if (!Web3GameManager.instance) {
      Web3GameManager.instance = new Web3GameManager();
    }
    return Web3GameManager.instance;
  }

  public async connect(): Promise<{ account: string; chainId: number; networkName: string; isSimulated: boolean }> {
    if (typeof window === 'undefined') {
      throw new Error('Window is undefined');
    }

    const anyWindow = window as any;
    if (anyWindow.ethereum) {
      try {
        this.web3 = new Web3(anyWindow.ethereum);
        const accounts = await anyWindow.ethereum.request({ method: 'eth_requestAccounts' });
        const chainIdHex = await anyWindow.ethereum.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);
        const account = accounts[0];

        let networkName = 'EVM Mainnet';
        if (chainId === 1) networkName = 'Ethereum Mainnet';
        else if (chainId === 137) networkName = 'Polygon POS';
        else if (chainId === 42161) networkName = 'Arbitrum One';
        else if (chainId === 11155111) networkName = 'Sepolia Testnet';
        else networkName = `Chain ID: ${chainId}`;

        this.isSimulated = false;
        return { account, chainId, networkName, isSimulated: false };
      } catch (err: any) {
        console.warn('Metamask connection cancelled, activating sandbox Web3 provider:', err.message);
      }
    }

    // Default to Sandbox Simulated Web3 Sovereign Account
    this.isSimulated = true;
    const mockAccount = '0x71AbuDhabi' + Math.random().toString(16).substring(2, 10) + 'EAE';
    if (!this.mockBalances.has(mockAccount)) {
      this.mockBalances.set(mockAccount, 250); // Welcome bonus of 250 $ADX
      this.mockNFTs.set(mockAccount, ['Saadiyat Genesis Deed #001']);
    }

    return {
      account: mockAccount,
      chainId: 1971, // UAE founding year
      networkName: 'Abu Dhabi Sovereign Web3 Sandbox',
      isSimulated: true,
    };
  }

  public async getTokenBalance(account: string): Promise<string> {
    if (this.isSimulated || !account) {
      const bal = this.mockBalances.get(account) || 250;
      return bal.toString();
    }

    try {
      if (this.web3) {
        // Query balance using web3.js
        const contract = new this.web3.eth.Contract(ADX_TOKEN_ABI as any, ADX_CONTRACT_ADDRESS);
        const bal: any = await contract.methods.balanceOf(account).call().catch(() => null);
        if (bal) {
          return this.web3.utils.fromWei(bal, 'ether');
        }
      }
    } catch (e) {
      // Fallback
    }
    const bal = this.mockBalances.get(account) || 250;
    return bal.toString();
  }

  public async claimFaucet(account: string, amount: number = 100): Promise<{ success: boolean; txHash: string }> {
    const current = this.mockBalances.get(account) || 0;
    this.mockBalances.set(account, current + amount);

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return { success: true, txHash };
  }

  public async mintLandNFT(account: string, districtName: string): Promise<{ success: boolean; tokenId: string; txHash: string }> {
    const currentBal = this.mockBalances.get(account) || 0;
    if (currentBal < 50) {
      throw new Error('Insufficient $ADX tokens. Claim from faucet first (50 $ADX required).');
    }
    this.mockBalances.set(account, currentBal - 50);

    const tokenId = `AD-${districtName.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const holdings = this.mockNFTs.get(account) || [];
    holdings.push(tokenId);
    this.mockNFTs.set(account, holdings);

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return { success: true, tokenId, txHash };
  }

  public async signDecree(account: string, decreeTitle: string): Promise<string> {
    const message = `[ABU DHABI EXECUTIVE COUNCIL]\nAuthorized Decree: "${decreeTitle}"\nMayor: ${account}\nTimestamp: ${new Date().toISOString()}`;
    const anyWindow = typeof window !== 'undefined' ? (window as any) : null;
    if (!this.isSimulated && anyWindow?.ethereum && this.web3) {
      try {
        const sig = await this.web3.eth.personal.sign(message, account, '');
        return sig;
      } catch (e) {
        // user rejected or not available
      }
    }

    // Simulated cryptographic signature (ECDSA format)
    return '0xsimulated' + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  public getNFTLandHoldings(account: string): string[] {
    return this.mockNFTs.get(account) || ['Saadiyat Genesis Deed #001'];
  }
}
