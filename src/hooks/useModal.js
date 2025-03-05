import { useContext } from 'react'
import ModalContext from '../context/ModalContext'

const useModal = () => {
  return useContext(ModalContext)
}

export default useModal
