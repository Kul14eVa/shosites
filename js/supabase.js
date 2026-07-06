/**
 * Подключение к Supabase + Storage
 */

const supabaseClient = supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);

console.log('✅ supabase.js загружен');

// ============================================================
// РАБОТА С ФАЙЛАМИ (STORAGE)
// ============================================================
const STORAGE = {
    uploadImage: async (file, folder = 'products') => {
        try {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${timestamp}_${random}.${fileExt}`;
            
            const { data, error } = await supabaseClient
                .storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw new Error(error.message);
            
            const { data: urlData } = supabaseClient
                .storage
                .from('product-images')
                .getPublicUrl(fileName);
            
            return {
                url: urlData.publicUrl,
                name: fileName
            };
        } catch (error) {
            console.error('❌ Ошибка загрузки файла:', error);
            throw error;
        }
    },
    
    deleteImage: async (imageName) => {
        try {
            const { error } = await supabaseClient
                .storage
                .from('product-images')
                .remove([imageName]);
            
            if (error) throw new Error(error.message);
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления файла:', error);
            throw error;
        }
    }
};

// ============================================================
// РАБОТА С БАЗОЙ ДАННЫХ
// ============================================================
const DB = {
    users: {
        create: async (email, password) => {
            const { data, error } = await supabaseClient
                .from('web_users')
                .insert([{ email, password_text: password }])
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        },
        login: async (email, password) => {
            const { data, error } = await supabaseClient
                .from('web_users')
                .select('*')
                .eq('email', email)
                .eq('password_text', password)
                .maybeSingle();
            if (error) throw new Error(error.message);
            return data;
        },
        exists: async (email) => {
            const { data, error } = await supabaseClient
                .from('web_users')
                .select('email')
                .eq('email', email)
                .maybeSingle();
            if (error) throw new Error(error.message);
            return !!data;
        }
    },
    orders: {
        create: async (order) => {
            const { data, error } = await supabaseClient
                .from('web_orders')
                .insert([order])
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        },
        getAll: async () => {
            const { data, error } = await supabaseClient
                .from('web_orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        updateStatus: async (id, status) => {
            const { data, error } = await supabaseClient
                .from('web_orders')
                .update({ status })
                .eq('id', id)
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        }
    },
    products: {
        getAll: async () => {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (product) => {
            const { data, error } = await supabaseClient
                .from('products')
                .insert([product])
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        },
        update: async (id, updates) => {
            const { data, error } = await supabaseClient
                .from('products')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        }
    },
    news: {
        getAll: async () => {
            const { data, error } = await supabaseClient
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (newsItem) => {
            const { data, error } = await supabaseClient
                .from('news')
                .insert([newsItem])
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        },
        delete: async (id) => {
            const { error } = await supabaseClient
                .from('news')
                .delete()
                .eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    }
};

window.DB = DB;
window.STORAGE = STORAGE;
window.supabaseClient = supabaseClient;