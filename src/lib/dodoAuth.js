import  {createClient} from "@supabase/supabase-js";

const supabase  = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getDodoApiKey(userId){
    const {data,error} = await supabase
    .from("dodo_payments_accounts")
    .select("api_key")
    .eq("user_id",userId)
    .single();

    if(error||!data) throw new Error("Dodo account not connected yet");

    return Buffer.from(data.api_key, "base64").toString("utf-8");
}