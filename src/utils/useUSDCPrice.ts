import { ChainId, Currency, currencyEquals, JSBI, Price, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import { MIM } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { useActiveWeb3React } from '../hooks'
import { wrappedCurrency } from './wrappedCurrency'

/**
 * Returns the price in MIM of the input currency
 * @param currency currency to compute the MIM price of
 */
export default function useMIMPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React()
  const wrapped = wrappedCurrency(currency, chainId)
  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WETH[chainId], wrapped) ? undefined : currency,
        chainId ? WETH[chainId] : undefined
      ],
      [wrapped?.equals(MIM) ? undefined : wrapped, chainId === ChainId.AVALANCHE ? MIM : undefined],
      [chainId ? WETH[chainId] : undefined, chainId === ChainId.AVALANCHE ? MIM : undefined]
    ],
    [chainId, currency, wrapped]
  )
  const [[ethPairState, ethPair], [MIMPairState, MIMPair], [MIMEthPairState, MIMEthPair]] = usePairs(tokenPairs)

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined
    }
    // handle weth/eth
    if (wrapped.equals(WETH[chainId])) {
      if (MIMPair) {
        const price = MIMPair.priceOf(WETH[chainId])
        return new Price(currency, MIM, price.denominator, price.numerator)
      } else {
        return undefined
      }
    }
    // handle MIM
    if (wrapped.equals(MIM)) {
      return new Price(MIM, MIM, '1', '1')
    }

    const ethPairETHAmount = ethPair?.reserveOf(WETH[chainId])
    const ethPairETHMIMValue: JSBI =
      ethPairETHAmount && MIMEthPair ? MIMEthPair.priceOf(WETH[chainId]).quote(ethPairETHAmount).raw : JSBI.BigInt(0)

    // all other tokens
    // first try the MIM pair
    if (MIMPairState === PairState.EXISTS && MIMPair && MIMPair.reserveOf(MIM).greaterThan(ethPairETHMIMValue)) {
      const price = MIMPair.priceOf(wrapped)
      return new Price(currency, MIM, price.denominator, price.numerator)
    }
    if (ethPairState === PairState.EXISTS && ethPair && MIMEthPairState === PairState.EXISTS && MIMEthPair) {
      if (MIMEthPair.reserveOf(MIM).greaterThan('0') && ethPair.reserveOf(WETH[chainId]).greaterThan('0')) {
        const ethMIMPrice = MIMEthPair.priceOf(MIM)
        const currencyEthPrice = ethPair.priceOf(WETH[chainId])
        const MIMPrice = ethMIMPrice.multiply(currencyEthPrice).invert()
        return new Price(currency, MIM, MIMPrice.denominator, MIMPrice.numerator)
      }
    }
    return undefined
  }, [chainId, currency, ethPair, ethPairState, MIMEthPair, MIMEthPairState, MIMPair, MIMPairState, wrapped])
}
