import { PackageType } from "@prisma/client"

export interface PackageFeatures {
    canAccessLatihan: boolean
    canAccessTryout: boolean
    tryoutLimit: number
    hasVideoExplanation: boolean
}

export function getPackageFeatures(packageType: PackageType | null | undefined): PackageFeatures {
    // Default features for users without a specific package (e.g., ADMIN or basic)
    const defaultFeatures: PackageFeatures = {
        canAccessLatihan: false,
        canAccessTryout: false,
        tryoutLimit: 0,
        hasVideoExplanation: false,
    }

    if (!packageType) return defaultFeatures

    switch (packageType) {
        case "REGULER":
            return {
                canAccessLatihan: false, // Explicitly no defined benefits for regular yet as per spec
                canAccessTryout: false,
                tryoutLimit: 0,
                hasVideoExplanation: false,
            }
        case "FLUX":
            return {
                canAccessLatihan: true,
                canAccessTryout: false,
                tryoutLimit: 0,
                hasVideoExplanation: false,
            }
        case "SENKU":
            return {
                canAccessLatihan: true,
                canAccessTryout: true,
                tryoutLimit: 1,
                hasVideoExplanation: false,
            }
        case "EINSTEIN":
            return {
                canAccessLatihan: true,
                canAccessTryout: true,
                tryoutLimit: 3,
                hasVideoExplanation: true,
            }
        default:
            return defaultFeatures
    }
}
