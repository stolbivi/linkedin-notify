import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { BACKEND_API, UserStage } from "../global"

export const useCustomStages = () => {
    const [customStages, setCustomStages] = useState<UserStage[]>([])
    const [fetchingCustomStages, setFetchingCustomStages] = useState(false)
    const [error, setError] = useState<any>()
    const fetchCustomStages = useRef<() => Promise<void>>(async() => {})
    const createCustomStage = useRef<(text: string) => Promise<UserStage | null>>(async() => null)

    createCustomStage.current = async(text: string): Promise<UserStage> => {
        const { data } = await axios.post(`${BACKEND_API}stage/userStage`, { text }, { withCredentials: true })
        return data
    }

    fetchCustomStages.current = async() => {
        try {
            const response = await fetch(`${BACKEND_API}stage/userStages`, { credentials: "include" })
            const data = await response.json()
            setCustomStages((data as any)?.response)
        } catch (error) {
            setError(error)
        } finally {
            setFetchingCustomStages(false)
        }
    }

    useEffect(() => {
        fetchCustomStages.current()
    }, [])

    return { customStages, setCustomStages, fetchingCustomStages, error, createStage: createCustomStage.current }
}