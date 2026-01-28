// Supabase Client Initialization
// 請將以下的 URL 和 Key 替換為您在 Supabase 專案設定中取得的資訊
const SUPABASE_URL = 'https://rkdmecqlxtovdngcxaaj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZG1lY3FseHRvdmRuZ2N4YWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjAzMzQsImV4cCI6MjA4NDk5NjMzNH0.6GN7DQvob-sJs4nQaM6pf0L8F_g3qhcV7afNDmDbqUQ';
const USER_ID = 'default_user'; // 固定 User ID，方便跨裝置存取同一份資料

// 檢查 Supabase 是否已載入d
if (typeof supabase === 'undefined') {
    console.error('Supabase SDK not loaded!');
}

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 通用 API 函式庫

/**
 * 取得指定類型的資料
 * @param {string} type - 資料類型 (e.g. 'baseballGame', 'subject')
 * @returns {Promise<Array>} - 資料陣列
 */
async function dbFetch(type) {
    const { data, error } = await _supabase
        .from('posts')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('type', type)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${type}:`, error);
        return [];
    }
    
    // 將資料轉換回原本的格式 (展平 data 欄位，並保留 id)
    return data.map(row => ({
        ...row.data,
        id: row.id, // 使用 DB 的 UUID
        _db_created_at: row.created_at // 保留 DB 建立時間供參考
    }));
}

/**
 * 新增資料
 * @param {string} type - 資料類型
 * @param {object} content - 資料內容 (JSON)
 * @returns {Promise<object|null>} - 新增後的資料 (含 ID)
 */
async function dbAdd(type, content) {
    // 移除 content 中可能存在的 id，讓 DB 產生新的 UUID
    const { id, ...dataToSave } = content;
    
    const { data, error } = await _supabase
        .from('posts')
        .insert([
            {
                user_id: USER_ID,
                type: type,
                data: dataToSave,
                created_at: new Date().toISOString()
            }
        ])
        .select()
        .single();

    if (error) {
        console.error(`Error adding ${type}:`, error);
        alert('儲存失敗，請檢查網路或 API Key 設定');
        return null;
    }

    return {
        ...data.data,
        id: data.id
    };
}

/**
 * 更新資料
 * @param {string} id - 資料 ID (UUID)
 * @param {object} content - 新的資料內容
 * @returns {Promise<boolean>} - 是否成功
 */
async function dbUpdate(id, content) {
    const { id: _, ...dataToSave } = content; // 確保不將 ID 存入 data 欄位

    const { error } = await _supabase
        .from('posts')
        .update({
            data: dataToSave,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error(`Error updating ${id}:`, error);
        alert('更新失敗');
        return false;
    }
    return true;
}

/**
 * 刪除資料
 * @param {string} id - 資料 ID (UUID)
 * @returns {Promise<boolean>} - 是否成功
 */
async function dbDelete(id) {
    const { error } = await _supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting ${id}:`, error);
        alert('刪除失敗');
        return false;
    }
    return true;
}
