import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";
import { getUserRole } from "../_shared/get_user_role.ts";
interface Payload {
    id: string; // the id of the orgs_users record
}
export const org_user_delete = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }
        // Get the title from the request body
        const id = payload.id;
        // get the org for this orgs_users record
        const { data: org, error: orgError } = await supabase
            .from("orgs_users")
            .select("orgid")
            .eq("id", id)
            .single();
        if (orgError) {
            return { data: null, error: orgError };
        }
        const orgid = org.orgid;
        console.log("*** org_user_delete org", org);
        console.log("*** org_user_delete orgid", orgid);
        const { data: userRole, error: userRoleError } = await getUserRole(
            orgid,
            user.id,
        );
        if (userRoleError) {
            return { data: null, error: userRoleError };
        }
        if (userRole !== "Owner") {
            return {
                data: null,
                error: "User is not an owner of the organization",
            };
        }

        // Insert new orgs_users row
        const { data: deleteData, error: deleteError } = await supabase
            .from("orgs_users")
            .delete()
            .eq("id", id)
            .select()
            .single();

        if (deleteError) {
            return { data: null, error: deleteError };
        }

        return { data: deleteData, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
};
