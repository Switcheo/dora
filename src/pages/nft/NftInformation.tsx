import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { ROUTES } from '../../constants'
import './NftInformation.scss'
import Neo3 from '../../assets/icons/neo3.svg'
import Neo2 from '../../assets/icons/neo2.svg'
import ZoomIcon from '../../assets/icons/zoom-icon.svg'
import BackButton from '../../components/navigation/BackButton'
import Modal from '@material-ui/core/Modal'
import CloseIcon from '@material-ui/icons/Close'
import useWindowWidth from '../../hooks/useWindowWidth'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers/nftReducer'
import { fetchNFT } from '../../actions/nftActions'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import NoImageFound from '../../assets/no-image-found.png'

interface MatchParams {
  contractHash: string
  chain: string
  network: string
  id: string
}

type Props = RouteComponentProps<MatchParams>

const NftInformation: React.FC<Props> = (props: Props) => {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const { contractHash, id, chain, network } = props.match.params
  const { state: hash } = props.location
  const width = useWindowWidth()
  const dispatch = useDispatch()
  const nftState = useSelector<{ nft: State }, State>(({ nft }) => nft)

  useEffect(() => {
    dispatch(fetchNFT(id, contractHash))
  }, [dispatch])

  const isMobileOrTablet = width <= 1200

  const minTextLength = 25

  const handleCloseModal = () => {
    setIsOpenModal(false)
  }

  const handleOpenModal = () => {
    setIsOpenModal(true)
  }

  const truncateText = (isMobile: boolean, text?: string) => {
    if (text) {
      if (isMobile && text.length > minTextLength) {
        const separator = '...'
        const firstHalf = text.substring(0, Math.floor(text.length / 2))
        const lastDigits = text.substring(text.length - 4, text.length)
        return firstHalf + separator + lastDigits
      } else {
        return text
      }
    } else {
      return ''
    }
  }

  const buildGhostMarketUrl = () => {
    return `https://ghostmarket.io/asset/n3/${nftState.value?.contract}/${nftState.value?.id}`
  }

  const hasAttributes = () => {
    return (
      nftState.value &&
      nftState.value.attributes &&
      nftState.value.attributes.length > 0
    )
  }

  function handleOnError({
    currentTarget,
  }: React.SyntheticEvent<HTMLImageElement, Event>) {
    currentTarget.onerror = null
    currentTarget.src = NoImageFound
  }

  function returnChainNameAndLogo() {
    if (nftState.value?.chain === 'n3') {
      return (
        <>
          <img className="token-logo" src={Neo3} alt="token-logo" />
          <span>NEO N3</span>
        </>
      )
    } else if (nftState.value?.chain === 'n2') {
      return (
        <>
          <img className="token-logo" src={Neo2} alt="token-logo" />
          <span>NEO LEGACY</span>
        </>
      )
    } else {
      return (
        <>
          <span>NEO LEGACY</span>
        </>
      )
    }
  }

  return (
    <div id="Nft" className="page-container">
      {hash && (
        <BackButton
          url={`${ROUTES.WALLET.url}/${chain}/${network}/${hash}/nfts`}
          text="back to address information"
        />
      )}
      <div className="inner-page-container">
        <div className="title-container items-center">
          {ROUTES.NFT.renderIcon()}
          <h1>NFT Information</h1>
        </div>

        <div className="nft-title justify-between">
          <span>{nftState.value?.name}</span>
          <span className="id">
            ID:
            <span className="number">
              {truncateText(isMobileOrTablet, nftState.value?.id)}
            </span>
          </span>
        </div>

        {nftState.isLoading ? (
          <SkeletonTheme
            color="#21383d"
            highlightColor="rgb(125 159 177 / 25%)"
          >
            <Skeleton height={650} style={{ margin: '50px 0' }} />
          </SkeletonTheme>
        ) : (
          <div className="nft-information-container">
            <div className="info-grid">
              <div
                className="image-container items-center"
                onClick={handleOpenModal}
              >
                <div className="image-content">
                  <img
                    src={nftState.value?.image}
                    alt="token-logo"
                    className="token-image"
                    onError={handleOnError}
                  />
                  <img
                    src={ZoomIcon}
                    alt="zoom-icon"
                    className="magnify-zoom-icon"
                  />
                </div>
              </div>
              <div className="verti justify-between">
                <div className="section-title">DETAILS</div>
                <div className="description-block">
                  <span className="title">DESCRIPTION</span>
                  <span className="content">{nftState.value?.description}</span>
                </div>
                <div className="info-grid">
                  <div className="content-block">
                    <span className="title">CREATOR</span>
                    <span className="grid-content">
                      {nftState.value?.creatorName ||
                        truncateText(true, nftState.value?.creatorAddress)}
                    </span>
                  </div>
                  <div className="content-block">
                    <span className="title">COLLECTION</span>
                    <div className="grid-content">
                      {/*
                        TODO: uncomment the code below when Ghostmarket fix their API, currently is not returning an image for the collection
                        <img
                          className="collection-logo"
                          src={nftState.value?.collection.image}
                          alt="token-logo"
                        />
                      */}
                      <span>{nftState.value?.collection?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="info-grid">
                  <div className="content-block">
                    <span className="title">SYMBOL</span>
                    <div className="grid-content">{nftState.value?.symbol}</div>
                  </div>
                  <div className="content-block">
                    <span className="title">BLOCKCHAIN</span>
                    <div className="grid-content">
                      {returnChainNameAndLogo()}
                    </div>
                  </div>
                </div>
                <div className="content-block">
                  <span className="title">CONTRACT</span>
                  <span className="inline-content">
                    {nftState.value?.contract}
                  </span>
                </div>
                <div className="content-block">
                  <span className="title">TOKEN URI</span>
                  <div className="inline-content">
                    {nftState.value?.apiUrl || buildGhostMarketUrl()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="nft-attributes-container">
          <p className="section-title">ATTRIBUTES</p>
          {!nftState.isLoading && (
            <div className="attributes-grid">
              {hasAttributes()
                ? nftState.value?.attributes.map(attr => (
                    <div className="attributes-block">
                      <span className="title">
                        {attr.key?.toUpperCase() ?? 'NO KEY'}
                      </span>
                      <span className="content">
                        {attr.value ?? 'No Value'}
                      </span>
                    </div>
                  ))
                : 'No Attributes'}
            </div>
          )}
          {nftState.isLoading && (
            <SkeletonTheme
              color="#21383d"
              highlightColor="rgb(125 159 177 / 25%)"
            >
              <Skeleton height={87} style={{ margin: '50px 0' }} />
            </SkeletonTheme>
          )}
        </div>
      </div>
      <Modal
        open={isOpenModal}
        onClose={handleCloseModal}
        className="modal-container items-center justify-center"
      >
        <div className="verti justify-center items-center modal-content">
          <div className="content-position">
            <button type="button" onClick={handleCloseModal}>
              <CloseIcon />
            </button>
          </div>
          <img src={nftState.value?.image} alt="token-logo" />
          <div className="content-position">{nftState.value?.name}</div>
        </div>
      </Modal>
    </div>
  )
}

export default withRouter(NftInformation)