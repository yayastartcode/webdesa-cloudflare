import { beforeAll, afterAll, expect, it } from 'vitest';
import { startRuntime, setupToken } from '../runtime.mjs';
let runtime, cookie;
const origin='http://localhost:8796';
const call=(path,method='GET',data)=>runtime.dispatchFetch(origin+path,{method,headers:{Origin:origin,Cookie:cookie??'',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
beforeAll(async()=>{
 runtime=await startRuntime(8796, 'production');
 const credentials={email:'content-audit@example.test',password:'local-content-audit-password-2026'};
 const setup=await runtime.dispatchFetch(origin+'/api/admin/create',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Setup-Token':setupToken},body:JSON.stringify({...credentials,name:'Content Audit'})});expect(setup.status).toBe(201);
 const login=await call('/api/auth/sign-in/email','POST',credentials);expect(login.status).toBe(200);cookie=login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
});
afterAll(async()=>{await runtime?.dispose();});
it('reads and updates the same latest record when historical singleton duplicates exist',async()=>{
 const db=await runtime.getD1Database('DB');
 const records=[
  {table:'village_info',path:'/api/village-info',values:{visi:'Latest vision',misi:'Latest mission',tujuan:'Latest goal'},payload:{visi:'Verified vision',misi:'Verified mission',tujuan:'Verified goal'},unwrap:r=>r},
  {table:'village_head_welcome',path:'/api/village-head-welcome',values:{content:'Latest welcome'},payload:{content:'Verified welcome'},unwrap:r=>r.data},
  {table:'population_data',path:'/api/population-data',values:{totalPopulation:10,malePopulation:6,femalePopulation:4,households:3,temporaryResidents:0,populationMutations:0},payload:{totalPopulation:20,malePopulation:12,femalePopulation:8,households:5,temporaryResidents:0,populationMutations:0},unwrap:r=>r.data},
 ];
 for(const record of records){
  const fields=Object.keys(record.values);const columns=['id',...fields,'createdAt','updatedAt'];const sql=`INSERT INTO ${record.table} (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map(()=>'?').join(',')})`;
  await db.batch([db.prepare(sql).bind(record.table+'-latest-edit',...Object.values(record.values),1,100),db.prepare(sql).bind(record.table+'-latest-create',...Object.values(record.values),2,90)]);
  const before=record.unwrap(await(await call(record.path)).json());expect(before.id).toBe(record.table+'-latest-edit');
  const saved=await call(record.path,'POST',record.payload);expect(saved.status).toBe(200);
  const after=record.unwrap(await(await call(record.path)).json());expect(after.id).toBe(before.id);for(const [key,value]of Object.entries(record.payload))expect(after[key]).toBe(value);
 }
});
it('keeps inactive navigation items for admin and makes header replacement atomic',async()=>{
 const data={logoUrl:'',navigationItems:[{label:'Beranda',href:'/',order:1,isActive:true},{label:'Disimpan nonaktif',href:'/contact',order:2,isActive:false}]};
 expect((await call('/api/header-settings','POST',data)).status).toBe(200);
 expect((await(await call('/api/header-settings')).json()).navigationItems).toHaveLength(1);
 const stored=await(await call('/api/header-settings?admin=true')).json();expect(stored.navigationItems).toHaveLength(2);expect(stored.navigationItems[1].isActive).toBe(false);
 expect((await call('/api/header-settings','POST',{logoUrl:'https://example.test/logo.png',navigationItems:stored.navigationItems.map(({label,href,order,isActive})=>({label,href,order,isActive}))})).status).toBe(200);
 expect((await(await call('/api/header-settings?admin=true')).json()).navigationItems).toHaveLength(2);
});
