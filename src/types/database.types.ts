
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "answers": {
                  Row: {
                    "answer": string | null,"created_at": string,"flagged": boolean,"id": string,"is_correct": boolean | null,"question_id": string,"submission_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer"?: string | null,"created_at"?: string,"flagged"?: boolean,"id"?: string,"is_correct"?: boolean | null,"question_id": string,"submission_id": string
                  }
                  Update: {
                    "answer"?: string | null,"created_at"?: string,"flagged"?: boolean,"id"?: string,"is_correct"?: boolean | null,"question_id"?: string,"submission_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "answers_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "answers_submission_id_fkey"
      columns: ["submission_id"]
isOneToOne: false
      referencedRelation: "submissions"
      referencedColumns: ["id"]
    }
                  ]
                },"courses": {
                  Row: {
                    "code": string,"created_at": string,"id": string,"is_active": boolean,"slug": string,"sort_order": number,"title": string,"track": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"slug": string,"sort_order"?: number,"title": string,"track": string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: string,"is_active"?: boolean,"slug"?: string,"sort_order"?: number,"title"?: string,"track"?: string
                  }
                  Relationships: [
                    
                  ]
                },"materials": {
                  Row: {
                    "content_md": string | null,"course_id": string | null,"created_at": string,"drive_url": string,"id": string,"is_free_preview": boolean,"is_published": boolean,"module_number": number | null,"podcast_url": string | null,"reading_time_minutes": number | null,"slug": string | null,"sort_order": number,"summary": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content_md"?: string | null,"course_id"?: string | null,"created_at"?: string,"drive_url"?: string,"id"?: string,"is_free_preview"?: boolean,"is_published"?: boolean,"module_number"?: number | null,"podcast_url"?: string | null,"reading_time_minutes"?: number | null,"slug"?: string | null,"sort_order"?: number,"summary"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "content_md"?: string | null,"course_id"?: string | null,"created_at"?: string,"drive_url"?: string,"id"?: string,"is_free_preview"?: boolean,"is_published"?: boolean,"module_number"?: number | null,"podcast_url"?: string | null,"reading_time_minutes"?: number | null,"slug"?: string | null,"sort_order"?: number,"summary"?: string | null,"title"?: string,"updated_at"?: string
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
                },"questions": {
                  Row: {
                    "category": Database["public"]['Enums']["QuestionCategory"],"correct_answer": string,"course_id": string | null,"created_at": string,"explanation": string | null,"id": string,"image_url": string | null,"option_a": string,"option_b": string,"option_c": string,"option_d": string,"option_e": string | null,"text": string,"type": Database["public"]['Enums']["QuestionType"],"updated_at": string,"weight": number
                  }
                  ComputedFields: never
                  Insert: {
                    "category": Database["public"]['Enums']["QuestionCategory"],"correct_answer": string,"course_id"?: string | null,"created_at"?: string,"explanation"?: string | null,"id"?: string,"image_url"?: string | null,"option_a": string,"option_b": string,"option_c": string,"option_d": string,"option_e"?: string | null,"text": string,"type"?: Database["public"]['Enums']["QuestionType"],"updated_at"?: string,"weight"?: number
                  }
                  Update: {
                    "category"?: Database["public"]['Enums']["QuestionCategory"],"correct_answer"?: string,"course_id"?: string | null,"created_at"?: string,"explanation"?: string | null,"id"?: string,"image_url"?: string | null,"option_a"?: string,"option_b"?: string,"option_c"?: string,"option_d"?: string,"option_e"?: string | null,"text"?: string,"type"?: Database["public"]['Enums']["QuestionType"],"updated_at"?: string,"weight"?: number
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
                },"registrations": {
                  Row: {
                    "calculated_price": number | null,"created_at": string,"email": string,"id": string,"name": string,"nim": string,"payment_proof_url": string,"plan_code": string | null,"pricing_tier": string | null,"reviewed_at": string | null,"reviewed_by": string | null,"status": Database["public"]['Enums']["RegistrationStatus"],"subject": string,"track": string | null,"type": Database["public"]['Enums']["RegistrationType"],"updated_at": string,"user_id": string | null,"whatsapp": string
                  }
                  ComputedFields: never
                  Insert: {
                    "calculated_price"?: number | null,"created_at"?: string,"email": string,"id"?: string,"name": string,"nim": string,"payment_proof_url": string,"plan_code"?: string | null,"pricing_tier"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["RegistrationStatus"],"subject": string,"track"?: string | null,"type": Database["public"]['Enums']["RegistrationType"],"updated_at"?: string,"user_id"?: string | null,"whatsapp": string
                  }
                  Update: {
                    "calculated_price"?: number | null,"created_at"?: string,"email"?: string,"id"?: string,"name"?: string,"nim"?: string,"payment_proof_url"?: string,"plan_code"?: string | null,"pricing_tier"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["RegistrationStatus"],"subject"?: string,"track"?: string | null,"type"?: Database["public"]['Enums']["RegistrationType"],"updated_at"?: string,"user_id"?: string | null,"whatsapp"?: string
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
                },"submissions": {
                  Row: {
                    "correct_count": number | null,"created_at": string,"expires_at": string | null,"id": string,"max_score": number | null,"question_order": (string)[] | null,"score": number | null,"started_at": string,"status": Database["public"]['Enums']["SubmissionStatus"],"submitted_at": string | null,"tab_switch_count": number,"total_count": number | null,"total_weight": number | null,"tryout_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "correct_count"?: number | null,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"max_score"?: number | null,"question_order"?: (string)[] | null,"score"?: number | null,"started_at"?: string,"status"?: Database["public"]['Enums']["SubmissionStatus"],"submitted_at"?: string | null,"tab_switch_count"?: number,"total_count"?: number | null,"total_weight"?: number | null,"tryout_id": string,"user_id": string
                  }
                  Update: {
                    "correct_count"?: number | null,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"max_score"?: number | null,"question_order"?: (string)[] | null,"score"?: number | null,"started_at"?: string,"status"?: Database["public"]['Enums']["SubmissionStatus"],"submitted_at"?: string | null,"tab_switch_count"?: number,"total_count"?: number | null,"total_weight"?: number | null,"tryout_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "submissions_tryout_id_fkey"
      columns: ["tryout_id"]
isOneToOne: false
      referencedRelation: "tryouts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "submissions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "created_at": string,"expires_at": string | null,"granted_by": string | null,"id": string,"notes": string | null,"plan_code": string,"registration_id": string | null,"starts_at": string,"status": string,"track": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at"?: string | null,"granted_by"?: string | null,"id"?: string,"notes"?: string | null,"plan_code": string,"registration_id"?: string | null,"starts_at"?: string,"status": string,"track": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string | null,"granted_by"?: string | null,"id"?: string,"notes"?: string | null,"plan_code"?: string,"registration_id"?: string | null,"starts_at"?: string,"status"?: string,"track"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_registration_id_fkey"
      columns: ["registration_id"]
isOneToOne: false
      referencedRelation: "registrations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subscriptions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"tryout_questions": {
                  Row: {
                    "created_at": string,"id": string,"order": number,"question_id": string,"tryout_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"order"?: number,"question_id": string,"tryout_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"order"?: number,"question_id"?: string,"tryout_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tryout_questions_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tryout_questions_tryout_id_fkey"
      columns: ["tryout_id"]
isOneToOne: false
      referencedRelation: "tryouts"
      referencedColumns: ["id"]
    }
                  ]
                },"tryouts": {
                  Row: {
                    "category": Database["public"]['Enums']["QuestionCategory"] | null,"course_id": string | null,"created_at": string,"description": string | null,"duration": number,"end_date": string | null,"id": string,"is_active": boolean,"is_free_sample": boolean,"is_practice": boolean,"max_attempts": number,"practice_part": number | null,"start_date": string | null,"status": Database["public"]['Enums']["TryoutStatus"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: Database["public"]['Enums']["QuestionCategory"] | null,"course_id"?: string | null,"created_at"?: string,"description"?: string | null,"duration": number,"end_date"?: string | null,"id"?: string,"is_active"?: boolean,"is_free_sample"?: boolean,"is_practice"?: boolean,"max_attempts"?: number,"practice_part"?: number | null,"start_date"?: string | null,"status"?: Database["public"]['Enums']["TryoutStatus"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "category"?: Database["public"]['Enums']["QuestionCategory"] | null,"course_id"?: string | null,"created_at"?: string,"description"?: string | null,"duration"?: number,"end_date"?: string | null,"id"?: string,"is_active"?: boolean,"is_free_sample"?: boolean,"is_practice"?: boolean,"max_attempts"?: number,"practice_part"?: number | null,"start_date"?: string | null,"status"?: Database["public"]['Enums']["TryoutStatus"],"title"?: string,"updated_at"?: string
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
                },"users": {
                  Row: {
                    "auth_id": string,"avatar_url": string | null,"created_at": string,"email": string,"id": string,"is_active": boolean,"last_login_at": string | null,"name": string,"role": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "auth_id": string,"avatar_url"?: string | null,"created_at"?: string,"email": string,"id"?: string,"is_active"?: boolean,"last_login_at"?: string | null,"name": string,"role"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "auth_id"?: string,"avatar_url"?: string | null,"created_at"?: string,"email"?: string,"id"?: string,"is_active"?: boolean,"last_login_at"?: string | null,"name"?: string,"role"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            "QuestionCategory": "WEEK_1"|"WEEK_2"|"WEEK_3"|"WEEK_4"|"WEEK_5"|"WEEK_6"|"WEEK_7"|"SERIES_POWER"|"COMPLEX_NUMBERS"|"LINEAR_ALGEBRA","QuestionType": "MULTIPLE_CHOICE"|"ESSAY","RegistrationStatus": "PENDING"|"APPROVED"|"REJECTED","RegistrationType": "REGULAR"|"UTS"|"KELAS_BESAR","SubmissionStatus": "IN_PROGRESS"|"SUBMITTED"|"TIMED_OUT","TryoutStatus": "DRAFT"|"ACTIVE"|"ARCHIVED"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "QuestionCategory": ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4", "WEEK_5", "WEEK_6", "WEEK_7", "SERIES_POWER", "COMPLEX_NUMBERS", "LINEAR_ALGEBRA"],"QuestionType": ["MULTIPLE_CHOICE", "ESSAY"],"RegistrationStatus": ["PENDING", "APPROVED", "REJECTED"],"RegistrationType": ["REGULAR", "UTS", "KELAS_BESAR"],"SubmissionStatus": ["IN_PROGRESS", "SUBMITTED", "TIMED_OUT"],"TryoutStatus": ["DRAFT", "ACTIVE", "ARCHIVED"]
          }
        }
} as const
