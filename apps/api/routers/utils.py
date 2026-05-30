from config import settings
from supabase import create_client

def get_supabase():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def get_db_user_id(user_info: dict) -> str:
    supabase = get_supabase()
    github_id_str = str(user_info["id"])
    res = supabase.table("users").select("id").eq("github_id", github_id_str).execute()
    if res.data:
        return res.data[0]["id"]
    
    # Provision new user on first login
    insert_res = supabase.table("users").insert({
        "github_id": github_id_str,
        "username": user_info["login"],
        "name": user_info.get("name") or user_info["login"],
        "avatar_url": user_info.get("avatar_url"),
        "email": user_info.get("email"),
    }).execute()
    return insert_res.data[0]["id"]
