export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    auth_id: string | null
                    email: string
                    name: string | null
                    full_name: string | null
                    nim: string | null
                    avatar_url: string | null
                    is_active: boolean
                    role: string | null
                    student_category: string | null
                    package_type: string | null
                    billing_cycle: string | null
                    session_token: string | null
                    access_ends_at: string | null
                    last_login_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    auth_id?: string | null
                    email: string
                    name?: string | null
                    full_name?: string | null
                    nim?: string | null
                    avatar_url?: string | null
                    is_active?: boolean
                    role?: string | null
                    student_category?: string | null
                    package_type?: string | null
                    billing_cycle?: string | null
                    session_token?: string | null
                    access_ends_at?: string | null
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    auth_id?: string | null
                    email?: string
                    name?: string | null
                    full_name?: string | null
                    nim?: string | null
                    avatar_url?: string | null
                    is_active?: boolean
                    role?: string | null
                    student_category?: string | null
                    package_type?: string | null
                    billing_cycle?: string | null
                    session_token?: string | null
                    access_ends_at?: string | null
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            courses: {
                Row: {
                    id: string
                    slug: string
                    code: string
                    title: string
                    track: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
                    is_active: boolean
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    code: string
                    title: string
                    track: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    code?: string
                    title?: string
                    track?: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                }
                Relationships: []
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    plan_code: "FREE" | "MONTHLY" | "SEMESTER"
                    track: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
                    status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED"
                    starts_at: string
                    expires_at: string | null
                    registration_id: string | null
                    granted_by: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan_code: "FREE" | "MONTHLY" | "SEMESTER"
                    track: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
                    status?: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED"
                    starts_at?: string
                    expires_at?: string | null
                    registration_id?: string | null
                    granted_by?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan_code?: "FREE" | "MONTHLY" | "SEMESTER"
                    track?: "PHYSICS_SEM_3" | "NON_PHYSICS" | "LEGACY" | "ALL"
                    status?: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED"
                    starts_at?: string
                    expires_at?: string | null
                    registration_id?: string | null
                    granted_by?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "subscriptions_registration_id_fkey"
                        columns: ["registration_id"]
                        isOneToOne: false
                        referencedRelation: "registrations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            questions: {
                Row: {
                    id: string
                    course_id: string | null
                    text: string
                    category: string
                    option_a: string
                    option_b: string
                    option_c: string
                    option_d: string
                    option_e: string | null
                    correct_answer: string
                    explanation: string | null
                    weight: number
                    image_url: string | null
                    type: "MULTIPLE_CHOICE" | "ESSAY"
                    subject: "FISDAS2" | "FISMAT"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    course_id?: string | null
                    text: string
                    category: string
                    option_a: string
                    option_b: string
                    option_c: string
                    option_d: string
                    option_e?: string | null
                    correct_answer: string
                    explanation?: string | null
                    weight?: number
                    image_url?: string | null
                    type?: "MULTIPLE_CHOICE" | "ESSAY"
                    subject?: "FISDAS2" | "FISMAT"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string | null
                    text?: string
                    category?: string
                    option_a?: string
                    option_b?: string
                    option_c?: string
                    option_d?: string
                    option_e?: string | null
                    correct_answer?: string
                    explanation?: string | null
                    weight?: number
                    image_url?: string | null
                    type?: "MULTIPLE_CHOICE" | "ESSAY"
                    subject?: "FISDAS2" | "FISMAT"
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "questions_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tryouts: {
                Row: {
                    id: string
                    course_id: string | null
                    title: string
                    description: string | null
                    category: string | null
                    duration: number
                    status: "DRAFT" | "ACTIVE" | "ARCHIVED"
                    max_attempts: number
                    is_practice: boolean
                    practice_part: number | null
                    is_published?: boolean
                    is_free_sample?: boolean
                    subject: "FISDAS2" | "FISMAT"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    course_id?: string | null
                    title: string
                    description?: string | null
                    category?: string | null
                    duration: number
                    status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
                    max_attempts?: number
                    is_practice?: boolean
                    practice_part?: number | null
                    is_published?: boolean
                    is_free_sample?: boolean
                    subject?: "FISDAS2" | "FISMAT"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string | null
                    title?: string
                    description?: string | null
                    category?: string | null
                    duration?: number
                    status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
                    max_attempts?: number
                    is_practice?: boolean
                    practice_part?: number | null
                    is_published?: boolean
                    is_free_sample?: boolean
                    subject?: "FISDAS2" | "FISMAT"
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tryouts_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tryout_questions: {
                Row: {
                    id: string
                    tryout_id: string
                    question_id: string
                    order: number
                }
                Insert: {
                    id?: string
                    tryout_id: string
                    question_id: string
                    order?: number
                }
                Update: {
                    id?: string
                    tryout_id?: string
                    question_id?: string
                    order?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "tryout_questions_tryout_id_fkey"
                        columns: ["tryout_id"]
                        isOneToOne: false
                        referencedRelation: "tryouts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tryout_questions_question_id_fkey"
                        columns: ["question_id"]
                        isOneToOne: false
                        referencedRelation: "questions"
                        referencedColumns: ["id"]
                    }
                ]
            }
            submissions: {
                Row: {
                    id: string
                    user_id: string
                    tryout_id: string
                    status: "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "TIMED_OUT"
                    score: number | null
                    total_weight: number | null
                    correct_count: number | null
                    total_count: number | null
                    started_at: string
                    submitted_at: string | null
                    finished_at: string | null
                    expires_at: string | null
                    question_order: string[]
                    tab_switch_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tryout_id: string
                    status?: "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "TIMED_OUT"
                    score?: number | null
                    total_weight?: number | null
                    correct_count?: number | null
                    total_count?: number | null
                    started_at?: string
                    submitted_at?: string | null
                    finished_at?: string | null
                    expires_at?: string | null
                    question_order?: string[]
                    tab_switch_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tryout_id?: string
                    status?: "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "TIMED_OUT"
                    score?: number | null
                    total_weight?: number | null
                    correct_count?: number | null
                    total_count?: number | null
                    started_at?: string
                    submitted_at?: string | null
                    finished_at?: string | null
                    expires_at?: string | null
                    question_order?: string[]
                    tab_switch_count?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "submissions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "submissions_tryout_id_fkey"
                        columns: ["tryout_id"]
                        isOneToOne: false
                        referencedRelation: "tryouts"
                        referencedColumns: ["id"]
                    }
                ]
            }
            answers: {
                Row: {
                    id: string
                    submission_id: string
                    question_id: string
                    answer: string | null
                    is_correct: boolean | null
                    flagged: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    submission_id: string
                    question_id: string
                    answer?: string | null
                    is_correct?: boolean | null
                    flagged?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    submission_id?: string
                    question_id?: string
                    answer?: string | null
                    is_correct?: boolean | null
                    flagged?: boolean
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "answers_submission_id_fkey"
                        columns: ["submission_id"]
                        isOneToOne: false
                        referencedRelation: "submissions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "answers_question_id_fkey"
                        columns: ["question_id"]
                        isOneToOne: false
                        referencedRelation: "questions"
                        referencedColumns: ["id"]
                    }
                ]
            }
            materials: {
                Row: {
                    id: string
                    course_id: string | null
                    slug: string | null
                    title: string
                    summary: string | null
                    content_md: string | null
                    pdf_url: string | null
                    drive_url: string | null
                    podcast_url: string | null
                    module_number: number | null
                    sort_order: number
                    is_free_preview: boolean
                    is_published: boolean
                    reading_time_minutes: number | null
                    subject: "FISDAS2" | "FISMAT"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    course_id?: string | null
                    slug?: string | null
                    title: string
                    summary?: string | null
                    content_md?: string | null
                    pdf_url?: string | null
                    drive_url?: string | null
                    podcast_url?: string | null
                    module_number?: number | null
                    sort_order?: number
                    is_free_preview?: boolean
                    is_published?: boolean
                    reading_time_minutes?: number | null
                    subject?: "FISDAS2" | "FISMAT"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string | null
                    slug?: string | null
                    title?: string
                    summary?: string | null
                    content_md?: string | null
                    pdf_url?: string | null
                    drive_url?: string | null
                    podcast_url?: string | null
                    module_number?: number | null
                    sort_order?: number
                    is_free_preview?: boolean
                    is_published?: boolean
                    reading_time_minutes?: number | null
                    subject?: "FISDAS2" | "FISMAT"
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "materials_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    }
                ]
            }
            registrations: {
                Row: {
                    id: string
                    user_id: string | null
                    type: "REGULAR" | "UTS" | "KELAS_BESAR"
                    plan_code: string | null
                    track: string | null
                    name: string
                    email: string
                    nim: string
                    subject: string
                    whatsapp: string
                    phone: string | null
                    student_category: string | null
                    package_type: string | null
                    billing_cycle: string | null
                    payment_proof_url: string
                    calculated_price: number | null
                    pricing_tier: string | null
                    status: "PENDING" | "APPROVED" | "REJECTED"
                    reviewed_by: string | null
                    reviewed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    type: "REGULAR" | "UTS" | "KELAS_BESAR"
                    plan_code?: string | null
                    track?: string | null
                    name: string
                    email: string
                    nim?: string
                    subject?: string
                    whatsapp?: string
                    phone?: string | null
                    student_category?: string | null
                    package_type?: string | null
                    billing_cycle?: string | null
                    payment_proof_url: string
                    calculated_price?: number | null
                    pricing_tier?: string | null
                    status?: "PENDING" | "APPROVED" | "REJECTED"
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    type?: "REGULAR" | "UTS" | "KELAS_BESAR"
                    plan_code?: string | null
                    track?: string | null
                    name?: string
                    email?: string
                    nim?: string
                    subject?: string
                    whatsapp?: string
                    phone?: string | null
                    student_category?: string | null
                    package_type?: string | null
                    billing_cycle?: string | null
                    payment_proof_url?: string
                    calculated_price?: number | null
                    pricing_tier?: string | null
                    status?: "PENDING" | "APPROVED" | "REJECTED"
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "registrations_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            regular_class_details: {
                Row: {
                    id: string
                    registration_id: string
                    group_size: number
                    session_count: number
                    scheduled_date: string
                    scheduled_time: string
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    registration_id: string
                    group_size: number
                    session_count: number
                    scheduled_date: string
                    scheduled_time: string
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    registration_id?: string
                    group_size?: number
                    session_count?: number
                    scheduled_date?: string
                    scheduled_time?: string
                    notes?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "regular_class_details_registration_id_fkey"
                        columns: ["registration_id"]
                        isOneToOne: true
                        referencedRelation: "registrations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            uts_package_details: {
                Row: {
                    id: string
                    registration_id: string
                    package_type: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    registration_id: string
                    package_type: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    registration_id?: string
                    package_type?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "uts_package_details_registration_id_fkey"
                        columns: ["registration_id"]
                        isOneToOne: true
                        referencedRelation: "registrations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            kelas_besar_details: {
                Row: {
                    id: string
                    registration_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    registration_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    registration_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "kelas_besar_details_registration_id_fkey"
                        columns: ["registration_id"]
                        isOneToOne: true
                        referencedRelation: "registrations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_subject_access: {
                Row: {
                    id: string
                    user_id: string
                    subject: "FISDAS2" | "FISMAT"
                    role: string
                    package_type: string | null
                    tryout_attempts_used: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    subject: "FISDAS2" | "FISMAT"
                    role?: string
                    package_type?: string | null
                    tryout_attempts_used?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    subject?: "FISDAS2" | "FISMAT"
                    role?: string
                    package_type?: string | null
                    tryout_attempts_used?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_subject_access_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            payments: {
                Row: {
                    id: string
                    user_id: string
                    amount: number | null
                    proof_url: string
                    status: "PENDING" | "APPROVED" | "REJECTED"
                    notes: string | null
                    reviewed_by: string | null
                    reviewed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount?: number | null
                    proof_url: string
                    status?: "PENDING" | "APPROVED" | "REJECTED"
                    notes?: string | null
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number | null
                    proof_url?: string
                    status?: "PENDING" | "APPROVED" | "REJECTED"
                    notes?: string | null
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Insertable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type Updatable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
